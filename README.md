<div align="center">

```
██╗███╗   ██╗███████╗██╗███╗   ██╗██╗████████╗██╗   ██╗██████╗  ██████╗
██║████╗  ██║██╔════╝██║████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔═══██╗
██║██╔██╗ ██║█████╗  ██║██╔██╗ ██║██║   ██║    ╚████╔╝ ██████╔╝██║   ██║
██║██║╚██╗██║██╔══╝  ██║██║╚██╗██║██║   ██║     ╚██╔╝  ██╔══██╗██║   ██║
██║██║ ╚████║██║     ██║██║ ╚████║██║   ██║      ██║   ██║  ██║╚██████╔╝
╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝ ╚═════╝

██╗   ██╗████████╗███████╗██████╗
██║   ██║╚══██╔══╝██╔════╝██╔══██╗
██║   ██║   ██║   █████╗  ██████╔╝
██║   ██║   ██║   ██╔══╝  ██╔══██╗
╚██████╔╝   ██║   ███████╗██║  ██║
 ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝
```

# infinityrouter-bulk-apikey

**Bulk-create InfinityRouter accounts with API keys — a New API fork whose reveal needs a `X-Security-Proof` step-up, plus a 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-2-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

InfinityRouter (`infinityrouter.dev`) is a **New API fork** (`QuantumNous/new-api v1.0.0-rc.34+`) wired to `subscription_only` billing: the only plans on sale are **$39 / $69 / $129 a month**, a fresh account gets `quota: 0`, check-in is switched off and there is no free or trial plan. None of that stops the two models in the account's own **`free` group** from answering: measured on 2026-10-21, `minimax-m3` (ratio 0.1) and `deepseek-v4.1-flash-1017` (ratio 0.02) return `chat-200` with usage, repeatedly (`GET /v1/models` → 200, 2 models).

Two gates stand between you and a key, and both were solved rather than skipped:

1. **Cloudflare Turnstile** on `GET /api/verification`, `POST /api/user/register` and `POST /api/user/login` (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). The token rides the query string, is single-use, and is bound to the solving IP (`siteverify` `remoteip`) — so the browser that mints it must spend it from the same exit. The panel publishes its own sitekey at `GET /api/status → data.turnstile_site_key` (`0x4AAAAAAFTBBpiFBKxXCi-q` measured); the CLI drives a real headful Chrome pinned to your exit and lets the page mint it.
2. **A "security proof" step-up on the key reveal.** `POST /api/token/<id>/key` alone answers **403 `SECURITY_PROOF_REQUIRED`**. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` returns `data.proof_token`, and the same reveal replayed with `X-Security-Proof: <proof_token>` answers 200 and the plaintext key. Wrong scope → `SECURITY_PROOF_SCOPE_MISMATCH`, right scope without context → 400 `SECURITY_CONTEXT_INVALID`, a JWT in place of the proof → `SECURITY_PROOF_INVALID`.

One more trap cost six attempts on 2026-10-18: the mail code is **6 HEX characters**, so a digits-only regex happily reads the CSS colour `404040` / `575757` out of the message and the panel answers *"Verification code is incorrect or has expired"*. The CLI takes `[0-9a-f]{6}` and ignores the colours.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Signup quota | **0** (`new_user_quota: 0`) — the allowance is the `free` group, not a balance |
| Billing mode | `billing_preference: "subscription_only"`; plans **Infinity Basic $39 / Pro $69 / Max $129 per month**, no free or trial plan |
| Free/trial plan | **none** (`free_plan: null`) |
| Daily check-in | **off** (`checkin_enabled: false`) |
| Account group | `free` — token group `auto` needs no rebinding |
| Talkable models | `minimax-m3` (ratio **0.1**), `deepseek-v4.1-flash-1017` (ratio **0.02**) |
| Cheapest entry | `deepseek-v4.1-flash-1017` at ratio 0.02 |
| Group ratios | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> The **gate is group-based, not model-based**: the account's `free` group models are not pre-consumed, which is why they answer at all while the panel's own wallet is empty.

> 💡 The free tier is set by InfinityRouter and can change. Check the live numbers at [infinityrouter.dev](https://infinityrouter.dev) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 2 of them

`GET /v1/models` with a fresh `free`-group key answers **2 models** (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — ratio 0.1, the CLI's default gate model
* `deepseek-v4.1-flash-1017` — ratio 0.02, cheapest

The key's group decides what `/v1/models` lists; `auto_groups` on this panel are `basic` / `pro` / `max`, so a paid plan would widen the set, but everything in this repo is measured with the `free` group a fresh account is born into.

## 🧪 How to use the API

The base URL is **`https://infinityrouter.dev/v1`** — OpenAI-compatible, so anything that speaks OpenAI works (SDKs, Cursor, OpenCode, Kilo Code, …). Anthropic-shaped clients use the bare host with `/v1/messages`.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* keys are **48-character base62**; the console shows them with an `sk-` prefix and **both forms are accepted** on `/v1`
* the account's `access_token` lives only **899 s (~15 min)**, and a re-login needs Turnstile again — the CLI finishes the whole chain in one run instead of resuming it later
* running the CLI with no pool goes direct; a proxy list makes each account solve and spend on one exit

## 🚀 One command

```bash
node src/cli.js --count 10
```

That is the whole tool. One real Chrome clears the Cloudflare Turnstile for you — that step is **automatic** (`--auto`, and it is on by default) — the account is created, its key is minted and every key is proven by a live `chat-200` before it reaches `keys.txt`. A `proxies.txt` next to the repo is picked up automatically (one pinned exit per account); without it the run goes DIRECT.

`--dry` prints the resolved plan — count, pool size, solver availability, model — and exits without touching a single file or making a request:

```bash
node src/cli.js --dry
```

Prefer a menu to flags? `npm start` (or `node src/launcher.js`) → **1) Mint keys** → *How many keys? [10]*.

> ⚠️ **Terms & account risk.** This tool automates account creation and API-key issuance against a third-party panel. That may break the panel's Terms of Service and can get accounts, keys or IPs banned. **Automation is your own responsibility**: read the provider's terms, use your own inbox and proxies, and make sure you are allowed to do this where you live before you run it.

## 🛠 Quick start

```bash
# 1) one account + one key, gated end-to-end (real Chrome + Cloudflare Turnstile, automatic)
node src/cli.js --count 1 --auto --pool proxies.txt

# 2) re-prove every key already in keys.txt (models + two distinct chats + a get_time tool call)
node src/cli.js --verify-only

# 3) talk to it
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

The `--pool` file is optional: without it the tool runs direct. With it, Chrome is launched one browser per attempt, pinned to that attempt's exit — the same address solves the Turnstile token and spends it, which the panel enforces.

### 🖱️ The launcher

`npm start` (or `node src/launcher.js`) is the menu form of the same CLI: **1) Mint keys** → *How many keys? [10]* (Enter accepts 10) runs `node src/cli.js --auto --count N`. It never asks about the captcha, a token or a proxy — `proxies.txt` is used automatically when present. If Chrome is missing the menu prints the one-line download command (or a clear error on a headless host), and it ends with a summary table (live/total, latency, error classes) plus the `keys.txt` path; keys that failed the gate land in `keys-dead.txt`.

## ✅ Verified working — every key is tested

Lab run 2026-10-21 (account id 41 / `ina49d3b`, WARP exit `104.28.216.172`), full chain: Turnstile token minted in-page → `GET /api/verification` 200 `success:true` → code `33b068` read from a 6-HEX mail (delivery ≤13 s, TTL 10 min) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 s) → token created → reveal stepped up with `X-Security-Proof` → key `lKT1XLW8n2S1…` (48 chars).

Then the gate, twice re-run: `GET /v1/models` → **200, 2 models**; `minimax-m3` and `deepseek-v4.1-flash-1017` both **HTTP 200 with `content:"ok"`**, in the original probe and in both re-verifications. Evidence: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), state `providers/infinityrouter/out/mint-20261021-state.json`; write-up `proxy-lab/out/infinityrouter-20261021.md`.

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

Signup, per account:

1. **page** — a real (headful) Chrome on one exit from your pool opens `/register`. Cloudflare's interstitial is localised to the browser language, so the CLI pins `--lang=en-US`.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (the panel's own key; the CLI falls back to the measured constant only if `/api/status` is unreachable).
3. **Turnstile** — the page's own widget mints the token; it is bound to the solving IP (`siteverify` `remoteip`), so **solve-exit = spend-exit**. The CLI walks the widget through closed shadow roots to reach the checkbox.
4. **mailbox** — a temp.tf hotmail/outlook **plus-alias**, one fresh address per account.
5. **code** — `GET /api/verification?email=&turnstile=` → the panel mails `Your verification code is: <strong>26995f</strong>`. Read **6 HEX chars** (not digits-only: the CSS colours `404040`/`575757` are in the same message); valid 10 min, delivered in ≤13 s.
6. **register + login** — `POST /api/user/register?turnstile=` then `POST /api/user/login?turnstile=` → console Bearer JWT plus the `new_api_refresh` cookie (the refresh cookie is `HttpOnly` on path `/api/user/auth`, so it has to be captured at login).
7. **key** — token created in `group=free`, then revealed through the step-up: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `POST /api/token/<id>/key` with `X-Security-Proof`.
8. **gate** — `/v1/chat/completions` only counts if `/v1/models` is 200, **two different prompts return two different non-empty texts**, and a `get_time` tool call comes back. A key is appended to `keys.txt` only after that; a failing one is recorded in `accounts.json` and retried next run.

> `/api/verify` is rate-limited **per user** (429 with an empty body and `retry-after` ~440–464 s; measured identical across four different exits while `/api/user/self` stayed 200 on each). It is `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`. Don't hammer the reveal — mint once, then reuse the proof.

## ⚙️ CLI options

| flag | meaning |
| --- | --- |
| `--count N` | accounts (= keys) to mint (default 1) |
| `--auto` | solve the Cloudflare Turnstile in a real Chrome automatically (**on by default**; `--no-auto` opts out) |
| `--dry` | print the resolved plan and exit (no accounts, no files, no network) |
| `--pool FILE` | exit list, one proxy per line (default `proxies.txt` if present; `INFINITYROUTER_POOL`) |
| `--proxy URL` | a single exit for every request |
| `--exits K` | exit candidates tried per account (default 3) |
| `--model ID` | model used for the live gate (default `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | token group the key is created in (default `free`) |
| `--port N` | Chrome DevTools port (default: a free one) |
| `--browser PATH` | Chrome binary (`CHROME_PATH`) |
| `--headless` | **not recommended** — Cloudflare only clears in a visible browser |
| `--keep` | leave Chrome open when the run ends |
| `--verify-only` | re-prove every key in `keys.txt`, mint nothing |

Zero dependencies; Node.js ≥ 22 for the global `WebSocket` and `fetch`.

## 🛰️ Behind a proxy

Your proxy list is **optional** — pass `--pool proxies.txt` and each attempt gets its own Chrome launched with `--proxy-server` on that attempt's exit, so every request that account makes (page, Turnstile solve, panel calls, the chat gate) leaves through one address. Without a pool the CLI connects directly, which is also the fastest way to find out that the Turnstile token and its spend have to share an exit. `http`, `socks5` and `socks4` exits are accepted; credentials are not supported.

## 📄 Files

| file | what |
| --- | --- |
| `keys.txt` | keys that passed the live gate, one per line |
| `accounts.json` | account ↔ exit ↔ proof record (written as it goes) |
| `keys-dead.txt` | keys that minted but never passed the live gate — retry material |
| `src/solver.js` | the browser + Cloudflare Turnstile engine behind `--auto` |
| `repo-spec.json` | this packaging spec |
| `public-cli.js` | mint / verify (node stdlib only) |
| `out/evidence-20261021.json` | the measured chain: gates, chain, chat, models, re-verifications |
| `out/mint-20261021-state.json` | the mint's own state |

## 🔌 Connect to 9Router

Add to 9Router as a custom OpenAI-compatible provider:

```json
{
  "name": "InfinityRouter",
  "prefix": "infinityrouter",
  "baseUrl": "https://infinityrouter.dev/v1",
  "apiKeyEnv": "INFINITYROUTER_KEY",
  "defaultModel": "minimax-m3",
  "models": ["minimax-m3", "deepseek-v4.1-flash-1017"]
}
```

`src/connect-9router.js` registers exactly this, and the launcher offers it. Anthropic-shaped clients point at the bare host (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 Connect to OmniRoute

Add to OmniRoute as a custom OpenAI-compatible provider:

```json
{
  "name": "InfinityRouter",
  "prefix": "infinityrouter",
  "baseUrl": "https://infinityrouter.dev/v1",
  "apiKeyEnv": "INFINITYROUTER_KEY",
  "defaultModel": "minimax-m3",
  "models": ["minimax-m3", "deepseek-v4.1-flash-1017"]
}
```

`src/connect-omniroute.js` registers exactly this, and the launcher offers it. Anthropic-shaped clients point at the bare host (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 What the provider gives | Cloudflare Turnstile beaten in a real Chrome, a security-proof step-up spent on the key reveal — and the `free` group answers chat-200 with no quota at all |
| 🔑 What one key gets you | one API key scoped to its own account: the 2 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Your data | only infinityrouter.dev and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

* **Group, not model, decides access.** The account's `free` group is what makes the two models answer while `quota` is 0 and billing is `subscription_only`. A key created in another group will not see the same set.
* **`/api/verify` is per-user rate-limited.** A 429 there comes back with an **empty body** and a `retry-after` around 440–464 s — the same TTL from every exit, so rotating proxies does not reset it. Wait it out; the reveal itself is fine.
* **Digits-only mail regex is wrong.** The code is 6 HEX chars and the message carries CSS colours (`404040`, `575757`) that a `\d{6}` pattern will happily accept — that mistake burned six attempts on 2026-10-18.
* **Turnstile tokens are IP-bound and single-use.** Solving in one network and spending from another fails with `Turnstile verification failed`; the CLI never splits them.
* **The session is short.** The console `access_token` lasts 899 s and a re-login needs a fresh Turnstile token, so a run that idles mid-chain has to start over.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>
