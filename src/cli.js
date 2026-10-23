#!/usr/bin/env node
'use strict';

/**
 * infinityrouter-bulk-apikey CLI — mint InfinityRouter accounts, one API key per
 * account, and keep only the keys that survived a live chat + tools gate.
 *
 * InfinityRouter is a New API fork (v1.0.0-rc.34+) with two extra gates, both
 * measured on 2026-10-21:
 *
 *   • Cloudflare Turnstile on /api/verification, /api/user/register and
 *     /api/user/login. The token rides the *query string* (`?turnstile=…`); an
 *     empty one answers "Turnstile token is empty", a wrong one "Turnstile
 *     verification failed". Tokens are single-use and bound to the solving IP,
 *     so the browser that mints them must share the exit that spends them.
 *     The sitekey is published by the panel itself: /api/status
 *     `data.turnstile_site_key`.
 *   • A "security proof" step-up on the key reveal: POST /api/token/<id>/key
 *     answers 403 SECURITY_PROOF_REQUIRED. POST /api/verify
 *     {method:'password', password, scope:'token.key.read', context:{token_id}}
 *     returns `data.proof_token`, and the same reveal replayed with
 *     `X-Security-Proof: <proof_token>` answers 200 and the plaintext key.
 *
 * The mail code is 6 HEX characters (a digits-only regex reads the CSS colour
 * "404040" out of the same message), valid 10 minutes.
 *
 * Flow, per account, every panel request through one exit from your pool:
 *   1. mailbox    temp.tf hotmail/outlook plus-alias (one address per account)
 *   2. page       /register in a real Chrome pinned to that exit
 *   3. code       GET /api/verification?email&turnstile → panel mails the code
 *   4. register   POST /api/user/register?turnstile → account created
 *   5. login      POST /api/user/login?turnstile → console Bearer JWT
 *   6. key        POST /api/token/ (group from /api/pricing) then reveal it,
 *                 stepping up with /api/verify when the fork masks it
 *   7. gate       /v1/chat/completions: chat-200, two different prompts that must
 *                 answer with different non-empty text, and a `get_time` tool call
 *
 * A key is appended to `keys.txt` only after step 7 passes; a key that never
 * passes is recorded in `accounts.json` and retried on the next run.
 *
 * Options:
 *   --count N        accounts (= keys) to mint                                [1]
 *   --auto           solve Cloudflare Turnstile in Chrome automatically (default)
 *   --dry            print the resolved plan and exit (nothing minted)
 *   --pool <file>    proxy list, one exit per line (env INFINITYROUTER_PROXIES)
 *   --proxy <url>    a single exit for everything
 *   --exits K        exits tried per account                                     [3]
 *   --model <id>     model used for the live gate                    [minimax-m3]
 *   --group <name>   token group the key is created in                      [free]
 *   --port N         Chrome DevTools port (default: a free one)
 *   --browser PATH   Chrome binary (env CHROME_PATH)
 *   --headless       NOT recommended — Cloudflare only clears in a visible browser
 *   --keep           leave Chrome open when the run ends
 *   --verify-only    re-run every key in keys.txt through the gate, mint nothing
 *   --help
 *
 * Zero dependencies. Node.js >= 22 (global WebSocket + fetch). Your proxy list
 * is OPTIONAL: pass --pool and every browser request leaves through an exit from
 * it; without a pool the tool connects directly.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
const DEAD_FILE = path.join(ROOT, 'keys-dead.txt');
const OUT_DIR = path.join(ROOT, 'out');

// ------------------------------------------------------------------ provider
const BASE = 'https://infinityrouter.dev';
const TITLE = 'InfinityRouter';
const ENV = 'INFINITYROUTER';
const MODEL_DEFAULT = 'minimax-m3';
const GROUP_DEFAULT = 'free';
const SITEKEY_FALLBACK = '0x4AAAAAAFTBBpiFBKxXCi-q';
const TEMPTF = 'https://temp.tf';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt;
};
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name[0]}`);

const HELP = `infinityrouter-bulk-apikey — mint InfinityRouter API keys (one account per key)

  node src/cli.js --count N       one command: mint N accounts + keys (Turnstile automatic)

  --count N        accounts to mint (default 1)
  --auto           solve Cloudflare Turnstile in a real Chrome automatically (DEFAULT)
  --dry            print the resolved plan and exit — no accounts, no files, no network
  --pool FILE      exit list, one proxy per line (default proxies.txt if present)
  --proxy URL      a single exit for every request
  --exits K        exit candidates tried per account (default 3)
  --model ID       model used for the live gate (default ${MODEL_DEFAULT})
  --group NAME     token group the key is created in (default ${GROUP_DEFAULT})
  --port N         Chrome DevTools port (default: a free one)
  --browser PATH   Chrome binary (env CHROME_PATH)
  --headless       NOT recommended — Cloudflare only clears in a visible browser
  --keep           leave Chrome open when the run ends
  --verify-only    re-prove every key in keys.txt, mint nothing
  --help           this text

Env: ${ENV}_MODEL, ${ENV}_POOL, CHROME_PATH
Default exits: none — without a pool the tool runs direct.`;

if (has('help') || argv.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '1'), 10) || 1);
const MODEL = arg('model', process.env[`${ENV}_MODEL`] || MODEL_DEFAULT);
const GROUP = arg('group', GROUP_DEFAULT);
const TRIES = Math.max(1, parseInt(arg('exits', '3'), 10) || 3);
const KEEP = has('keep');
const HEADLESS = has('headless');
const AUTO = !has('no-auto');  // --auto is the DEFAULT; --no-auto is the escape hatch
const VERIFY_ONLY = has('verify-only');
const POOL_ARG = arg('pool', process.env[`${ENV}_POOL`] || '');
const FIXED = arg('proxy', '');
const PORT_ARG = parseInt(arg('port', '0'), 10) || 0;
const CHROME_BIN = arg('browser', process.env.CHROME_PATH || '');
const MAIL_WAIT_MS = Math.max(90000, (parseInt(arg('mail-timeout', '300'), 10) || 300) * 1000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const randUser = () => `${['julian', 'nadia', 'soraya', 'felix', 'iris', 'lena', 'maya', 'tobias', 'elena', 'marcus'][crypto.randomBytes(1)[0] % 10]}${100 + (crypto.randomBytes(2).readUInt16BE(0) % 900)}`;
const randPass = () => `Ir${crypto.randomBytes(3).toString('hex')}${100 + (crypto.randomBytes(2).readUInt16BE(0) % 900)}!x`;

// --------------------------------------------------------------------- http
/** One plain request. `body` is a JSON object or null. Returns {status,text,json}. */
function request(url, { method = 'GET', headers = {}, body = null, timeoutMs = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = https.request({
      host: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'user-agent': UA,
        accept: 'application/json',
        ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
        ...headers,
      },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { text += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(text); } catch (e) { /* html or SSE */ }
        resolve({ status: res.statusCode, text, json });
      });
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout after ${timeoutMs}ms`)));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const msgOf = (r) =>
  (r.json && (r.json.message || r.json.msg || (r.json.error && (r.json.error.message || r.json.error)) || r.json.detail)) ||
  String(r.text || '').slice(0, 200);

// -------------------------------------------------------------------- exits
/** `protocol://host:port` (http / socks5 / socks4). Credentials are not supported. */
function parseProxy(line) {
  const s = String(line).trim().split(/\s+/)[0];
  const m = s.match(/^(?:(https?|socks5h?|socks4a?):\/\/)?([^:/@\s]+):(\d+)$/);
  if (!m) return null;
  const protocol = (m[1] || 'http').replace('socks5h', 'socks5').replace('socks4a', 'socks4');
  return { protocol, host: m[2], port: parseInt(m[3], 10), line: s };
}
const proxyLabel = (p) => (p ? `${p.protocol}://${p.host}:${p.port}` : '(direct)');
const chromeProxy = (p) => (p ? `${p.protocol}://${p.host}:${p.port}` : null);

function loadExits() {
  if (FIXED) return [parseProxy(FIXED)].filter(Boolean);
  const file = POOL_ARG || (fs.existsSync(path.join(ROOT, 'proxies.txt')) ? path.join(ROOT, 'proxies.txt') : '');
  if (!file) return [];
  if (!fs.existsSync(file)) { log(`pool ${file} not found — running direct`); return []; }
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map(parseProxy)
    .filter(Boolean);
}

// ------------------------------------------------------- chrome / CDP / solver
// The browser + Cloudflare Turnstile engine lives in ./solver.js (single file).
// The captcha step is automatic (--auto, the default): the mint flow mints its
// tokens with obtainToken() on the very page it is driving — one account, one
// exit, one browser, one tab. (solveCaptcha() is the module's shared one-shot
// entry point, exported for callers that do not already drive a page.)
const { solveCaptcha, findChrome, freePort, launchChrome, killChrome, Page, obtainToken } = require('./solver.js');

if (has('dry')) {
  const exits = loadExits();
  let chrome = '';
  try { chrome = findChrome(CHROME_BIN); } catch (e) { chrome = ''; }
  console.log(`dry run — nothing minted, no files touched, no network calls
  count    ${COUNT}
  pool     ${exits.length ? `${exits.length} exit(s)` : 'DIRECT (no proxy)'}
  solver   embedded (src/solver.js)${chrome ? ` + ${chrome}` : ' — Chrome NOT found (set CHROME_PATH)'}
  auto     ${AUTO ? 'on (default)' : 'off'}
  model    ${MODEL}
  group    ${GROUP}
  browser  ${HEADLESS ? 'headless (NOT recommended)' : 'headful'}`);
  process.exit(0);
}
// ---------------------------------------------------------------------- mail
/** temp.tf: real Microsoft-family mailboxes, one plus-alias per account, JSON reader. */
class Mailbox {
  constructor(address = null) { this.address = address; }

  async #call(method, p, body) {
    for (let i = 0; i < 4; i++) {
      const r = await request(TEMPTF + p, { method, body, timeoutMs: 30000 }).catch((e) => ({ error: e }));
      if (r.error) { await sleep(1500); continue; }
      if (r.status === 200) return r.json;
      if (r.status === 429) { await sleep(20000); continue; }
      throw new Error(`temp.tf ${p} → ${r.status} ${String(r.text).slice(0, 120)}`);
    }
    throw new Error(`temp.tf ${p}: no answer after retries`);
  }

  /** One fresh alias on a live Outlook/Hotmail pool account. */
  async open() {
    const j = await this.#call('GET', '/api/account?providers=outlook,hotmail&dot=0&plus=1');
    const address = String((j && j.email) || '').trim();
    if (!/@/.test(address)) throw new Error(`temp.tf: no address in ${JSON.stringify(j).slice(0, 120)}`);
    this.address = address;
    return address;
  }

  async messages() {
    if (!this.address) throw new Error('mailbox: open() first');
    const j = await this.#call('POST', '/api/check', { email: this.address, wait: false });
    const list = Array.isArray(j) ? j : (j && (j.data || j.messages)) || [];
    return list.map((m, i) => ({
      id: String(m.id || i),
      subject: String(m.subject || ''),
      from: String(m.from || ''),
      text: String(m.text || m.body || m.html || ''),
    }));
  }

  /**
   * The panel mails `Your verification code is: <strong>26995f</strong>` — the
   * code is 6 HEX characters, so a digits-only read picks the CSS colour
   * "404040" out of the same message instead. Messages already in the shared
   * pool box before the send are ignored.
   */
  async waitForCode({ timeoutMs = MAIL_WAIT_MS, pollMs = 6000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    const seen = new Set();
    while (Date.now() < deadline) {
      for (const m of await this.messages()) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        const code = extractCode(m.subject, m.text);
        if (code) return { code, subject: m.subject };
      }
      await sleep(pollMs);
    }
    throw new Error(`no verification mail in ${this.address} within ${Math.round(timeoutMs / 1000)}s`);
  }
}

const CODE_NEAR_RE = /(?:verification code|code|验证码)[^0-9a-z]{0,30}([0-9a-f]{4,10})(?![0-9a-z])/i;
const CODE_ANY_RE = /(?:^|[^0-9a-z])(?=[0-9a-f]*\d)([0-9a-f]{6})(?![0-9a-z])/i;
function extractCode(subject, text) {
  const clean = `${subject} ${text}`.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const m = clean.match(CODE_NEAR_RE) || clean.match(CODE_ANY_RE);
  return m ? m[1] : null;
}

// --------------------------------------------------------------------- panel
let AUTH = null;  // this fork authenticates the console with a Bearer JWT
let UID = null;

/** Same-origin in-page fetch: it inherits the exit IP, UA, cookies and cf_clearance. */
async function api(page, p, { method = 'GET', body = null, headers = {}, timeoutMs = 60000 } = {}) {
  const r = await page.eval(`(async () => {
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), ${timeoutMs});
      const res = await fetch(${JSON.stringify(BASE + p)}, { method: ${JSON.stringify(method)}, credentials: 'include',
        headers: { 'Content-Type': 'application/json'${AUTH ? `, Authorization: 'Bearer ${AUTH}'` : ''}${UID ? `, 'New-Api-User': '${UID}'` : ''}${Object.entries(headers).map(([k, v]) => `, ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join('')} },
        ${body == null ? '' : `body: ${JSON.stringify(JSON.stringify(body))},`} signal: ac.signal });
      clearTimeout(t);
      return { status: res.status, body: await res.text() };
    } catch (e) { return { status: 0, body: String(e && e.message || e) }; }
  })()`, timeoutMs + 15000);
  let json = null;
  try { json = JSON.parse(r.body); } catch (e) { /* html (cloudflare) */ }
  return { status: r.status, json, text: String(r.body).slice(0, 1200) };
}

/** Chat-completions are cross-origin from the panel page, so the key gate runs direct. */

const tokenIds = (r) => {
  const d = r && r.json && r.json.data;
  const items = (d && (d.items || d)) || [];
  return Array.isArray(items) ? items.filter((t) => t && typeof t === 'object') : [];
};

/** POST /api/token/ then read the plaintext key, stepping up when the fork masks it. */
async function mintKey(page, password) {
  const created = await api(page, '/api/token/', {
    method: 'POST',
    body: { name: `ir${Date.now().toString(36)}`, remain_quota: 500000, expired_time: -1, unlimited_quota: true, model_limits_enabled: false, model_limits: '', allow_ips: '', group: GROUP },
  });
  let created0 = created.json && created.json.data;
  if (typeof created0 === 'string') created0 = { key: created0 };
  if (created0 && typeof created0.key === 'string' && created0.key && !created0.key.includes('*')) return { key: created0.key, token_id: created0.id, via: 'create' };
  log(`  token create → ${created.status} ${msgOf(created).slice(0, 100)}`);

  const list = await api(page, '/api/token/?p=0&size=10');
  const items = tokenIds(list);
  for (const t of items) {
    if (typeof t.key === 'string' && t.key && !t.key.includes('*')) return { key: t.key, token_id: t.id, via: 'list' };
  }
  const row = items[0] || created0 || null;
  const id = (row && row.id) || null;
  if (!id) throw new Error('no token id in the console');

  // the reveal is behind the fork's security-proof step-up
  let proof = null;
  const scope = 'token.key.read';
  for (let attempt = 1; attempt <= 2 && !proof; attempt++) {
    const v = await api(page, '/api/verify', { method: 'POST', body: { method: 'password', password, scope, context: { token_id: id } } });
    proof = v.json && v.json.data && (v.json.data.proof_token || v.json.data.proof || v.json.data.token);
    if (!proof) {
      log(`  verify → ${v.status} ${msgOf(v).slice(0, 120)}${v.status === 429 ? ' (rate limited — waiting)' : ''}`);
      if (v.status === 429) await sleep(45000);
      else break;
    }
  }
  const reveal = await api(page, `/api/token/${id}/key`, proof ? { method: 'POST', body: {}, headers: { 'X-Security-Proof': proof } } : { method: 'POST', body: {} });
  let k = reveal.json && reveal.json.data;
  if (k && typeof k === 'object') k = k.key || k.token || k.api_key;
  if (typeof k !== 'string' || !k || k.includes('*')) throw new Error(`token key not readable: ${msgOf(reveal).slice(0, 160)}`);
  return { key: k, token_id: id, via: proof ? 'reveal+proof' : 'reveal' };
}

/** One account, end to end, on one exit. */
async function mintOnExit(page, exit, sitekey) {
  const box = new Mailbox();
  let email = await box.open();
  const username = randUser();
  const password = randPass();
  log(`  box ${email} user=${username}`);
  const rec = { email, username, password, exit: proxyLabel(exit), at: new Date().toISOString() };

  await page.goto(`${BASE}/register`, { waitMs: 3500 });
  const healthy = await page.waitFor("!!document.querySelector('#root') && document.querySelector('#root').children.length>0", { timeoutMs: 30000 });
  log(`  page ${await page.url()} healthy=${healthy}`);
  if (!healthy) throw new Error('register page did not render');

  // A plus-alias box can already carry an account; the cure is a fresh alias.
  for (let attempt = 1; ; attempt++) {
    const t1 = await obtainToken(page.cdp, page, sitekey, `ts1.${attempt}`);
    log(`  ts1 ${t1.token.length}(${t1.via})`);
    if (!t1.token) throw new Error('turnstile-token-empty');
    const send = await api(page, `/api/verification?email=${encodeURIComponent(email)}&turnstile=${encodeURIComponent(t1.token)}`);
    log(`  send-code → ${send.status} ${msgOf(send)}`);
    if (send.json && send.json.success) break;
    if (!/already exists/i.test(msgOf(send)) || attempt >= 3) throw new Error(`send-code-failed: ${msgOf(send)}`);
    email = await box.open();
    rec.email = email;
    log(`  mailbox already registered → fresh alias ${email}`);
  }
  const mail = await box.waitForCode();
  log(`  code ${mail.code} «${String(mail.subject).slice(0, 50)}»`);

  const t2 = await obtainToken(page.cdp, page, sitekey, 'ts2');
  log(`  ts2 ${t2.token.length}(${t2.via})`);
  const reg = await api(page, `/api/user/register?turnstile=${encodeURIComponent(t2.token)}`, {
    method: 'POST',
    body: { username, password, email, verification_code: String(mail.code), aff_code: '', turnstile: t2.token },
  });
  log(`  register → ${reg.status} ${msgOf(reg)}`);
  if (!(reg.json && reg.json.success)) throw new Error(`register-failed: ${msgOf(reg)}`);
  AUTH = (reg.json.data && reg.json.data.access_token) || AUTH;
  UID = (reg.json.data && reg.json.data.id) || UID;

  let self = await api(page, '/api/user/self');
  if (self.status !== 200) {
    const t3 = await obtainToken(page.cdp, page, sitekey, 'ts3');
    const li = await api(page, `/api/user/login?turnstile=${encodeURIComponent(t3.token)}`, { method: 'POST', body: { username, password } });
    log(`  login → ${li.status} ${msgOf(li)}`);
    AUTH = (li.json && li.json.data && li.json.data.access_token) || AUTH;
    UID = (li.json && li.json.data && li.json.data.id) || UID;
    self = await api(page, '/api/user/self');
  }
  rec.quota = self.json && self.json.data && (self.json.data.quota ?? null);
  rec.group = self.json && self.json.data && self.json.data.group;
  log(`  self → ${self.status} quota=${rec.quota} group=${rec.group}`);

  const k = await mintKey(page, password);
  rec.key = k.key;
  rec.token_id = k.token_id;
  log(`  key ${k.key.slice(0, 10)}… (${k.via})`);
  return rec;
}

// ----------------------------------------------------------------------- proof
const P1 = 'Reply with the single word: pong';
const P2 = 'Name three colours, comma separated.';
const TOOLS = [{ type: 'function', function: { name: 'get_time', description: 'Returns the current time', parameters: { type: 'object', properties: {} } } }];

const ansOf = (json, text) => {
  const m = json && json.choices && json.choices[0] && json.choices[0].message;
  if (m) {
    const t = String(m.content || m.reasoning_content || m.reasoning || '').trim();
    if (t) return { text: t, toolCalls: m.tool_calls || null };
  }
  // panels that answer stream-shaped even with stream:false
  if (typeof text === 'string' && /^data:/m.test(text)) {
    let acc = '';
    let tools = null;
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue;
      let j = null;
      try { j = JSON.parse(line.slice(5).trim() || '{}'); } catch (e) { continue; }
      for (const ch of j.choices || []) {
        const d = ch.delta || {};
        acc += (d.content || '') + (d.reasoning_content || '');
        if (d.tool_calls) tools = d.tool_calls;
      }
    }
    return { text: acc.trim(), toolCalls: tools };
  }
  return { text: '', toolCalls: null };
};

/** chat-200 + two different prompts (non-empty, different text) + a tool call. */
async function proveKey(key, model = MODEL) {
  const auth = { authorization: `Bearer ${key}`, 'content-type': 'application/json' };
  const out = { models: null, chat: [], tools: null };
  const models = await request(`${BASE}/v1/models`, { headers: { authorization: `Bearer ${key}` } }).catch((e) => ({ status: 0, text: String(e.message) }));
  const ids = ((models.json && models.json.data) || []).map((m) => m.id);
  out.models = { status: models.status, ids: ids.length };
  const want = [model, ...ids].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 3);

  const answers = [];
  for (const prompt of [P1, P2]) {
    for (const id of want) {
      const r = await request(`${BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: auth,
        body: { model: id, messages: [{ role: 'user', content: prompt }], max_tokens: 64, stream: false },
        timeoutMs: 120000,
      });
      const { text } = ansOf(r.json, r.text);
      out.chat.push({ model: id, prompt: prompt.slice(0, 12), status: r.status, chars: text.length, sample: text.slice(0, 60) });
      if (r.status === 200 && text) { answers.push(text); break; }
    }
  }
  out.sane = answers.length === 2 && answers[0].length > 0 && answers[1].length > 0 && answers[0] !== answers[1];

  const id = want[0];
  const t = await request(`${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: auth,
    body: { model: id, messages: [{ role: 'user', content: 'What time is it right now? Use the get_time tool.' }], tools: TOOLS, tool_choice: 'auto', max_tokens: 256, stream: false },
    timeoutMs: 120000,
  });
  const { toolCalls, text } = ansOf(t.json, t.text);
  out.tools = { model: id, status: t.status, called: !!(toolCalls && toolCalls.length), name: toolCalls && toolCalls[0] && toolCalls[0].function && toolCalls[0].function.name, chars: text.length };

  out.live = out.models.status === 200 && out.sane && !!(out.tools && out.tools.called);
  return out;
}

// ---------------------------------------------------------------------- files
const readKeys = () => fs.existsSync(KEYS_FILE)
  ? fs.readFileSync(KEYS_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : [];
const appendKey = (key) => {
  if (readKeys().includes(key)) return false;
  fs.appendFileSync(KEYS_FILE, (fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '\n' : '') + key + '\n');
  return true;
};
const readDead = () => fs.existsSync(DEAD_FILE)
  ? fs.readFileSync(DEAD_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  : [];
/** Keys that minted but never passed the live gate — retry material, not keys.txt. */
const appendDead = (key) => {
  const have = readDead();
  if (!key || have.includes(key)) return false;
  fs.appendFileSync(DEAD_FILE, (have.length ? '\n' : '') + key + '\n');
  return true;
};
const readAccounts = () => { try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')); } catch (e) { return []; } };
const saveAccount = (rec) => {
  const all = readAccounts();
  const i = all.findIndex((r) => r.email === rec.email);
  if (i >= 0) all[i] = rec; else all.push(rec);
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(all, null, 2) + '\n');
};

// ----------------------------------------------------------------------- modes
/** The panel publishes its own Turnstile sitekey; the constant is the fallback. */
async function sitekey() {
  const r = await request(`${BASE}/api/status`).catch(() => null);
  const k = r && r.json && r.json.data && r.json.data.turnstile_site_key;
  return k || SITEKEY_FALLBACK;
}

/**
 * Chrome pins its proxy at launch, so each attempt gets its own browser on that
 * attempt's exit: one account, one exit, one browser, one tab.
 */
async function mint(exits, count, sk) {
  const t0 = Date.now();
  const reasons = new Map();
  const note = (cls) => reasons.set(cls, (reasons.get(cls) || 0) + 1);
  log(`sitekey ${sk} · model ${MODEL} · group ${GROUP} · ${exits.length ? `${exits.length} exit(s)` : 'DIRECT (no proxy)'} · ${HEADLESS ? 'headless (NOT recommended)' : 'headful'}`);
  let minted = 0;
  for (let n = 1; n <= count; n++) {
    const attempts = Math.max(TRIES, exits.length);
    for (let k = 0; k < attempts; k++) {
      const exit = exits.length ? exits[(n - 1 + k) % exits.length] : null;
      const port = PORT_ARG || await freePort();
      const chrome = await launchChrome(chromeProxy(exit), port, { headless: HEADLESS, chrome: CHROME_BIN }).catch((e) => { log(`chrome failed: ${e.message}`); note('chrome'); return null; });
      if (!chrome) break;
      let page = null;
      try {
        page = await Page.open(port);
        const rec = await mintOnExit(page, exit, sk);
        AUTH = null;
        UID = null;
        const proof = await proveKey(rec.key);
        rec.proof = proof;
        if (!proof.live) {
          rec.status = 'key-unverified';
          saveAccount(rec);
          appendDead(rec.key);
          note('key-unverified');
          log(`  ✖ key not proven: ${JSON.stringify(proof).slice(0, 220)}`);
          continue;
        }
        rec.status = 'minted';
        appendKey(rec.key);
        saveAccount(rec);
        minted++;
        log(`  ✔ key ${n}/${count} live — models=${proof.models.status}(${proof.models.ids}) sanity=${proof.sane} tools=${proof.tools.called ? proof.tools.name : 'no'}`);
        break;
      } catch (e) {
        note(String(e.message).split(':')[0].slice(0, 40));
        log(`  ✖ ${proxyLabel(exit)}: ${String(e.message).slice(0, 180)}`);
        if (k + 1 >= attempts) log(`  ✖ giving up on account ${n}/${count}`);
      } finally {
        if (page) page.close();
        if (!KEEP) killChrome(chrome.child, chrome.profile);
        else log(`chrome kept on ${port} (exit ${proxyLabel(exit)})`);
      }
    }
  }
  log(`done: ${minted}/${count} keys minted`);
  if (minted) log(`keys.txt → ${KEYS_FILE}`);
  // machine-readable tail for the launcher's summary table
  console.log('__MINT_SUMMARY__ ' + JSON.stringify({
    requested: count,
    live: minted,
    ms: Date.now() - t0,
    errors: [...reasons.entries()].map(([c, v]) => `${c}×${v}`),
    keysFile: KEYS_FILE,
    deadFile: fs.existsSync(DEAD_FILE) ? DEAD_FILE : null,
  }));
}

async function verifyOnly() {
  const keys = readKeys();
  if (!keys.length) { log(`no keys in ${KEYS_FILE}`); return; }
  let live = 0;
  for (const key of keys) {
    const proof = await proveKey(key);
    if (proof.live) live++;
    log(`${key.slice(0, 12)}… models=${proof.models.status}(${proof.models.ids}) sanity=${proof.sane} tools=${proof.tools.called ? proof.tools.name : 'no'} ${proof.live ? 'LIVE' : 'DEAD'}`);
  }
  log(`live: ${live}/${keys.length}`);
}

// ------------------------------------------------------------------------ main
(async () => {
  const exits = loadExits();
  if (!exits.length) log('running WITHOUT a proxy (direct) — pass --pool proxies.txt to rotate exits');
  if (VERIFY_ONLY) return verifyOnly();
  await mint(exits, COUNT, await sitekey());
})().catch((e) => { console.error('FATAL', e && e.message ? e.message : e); process.exit(1); });
