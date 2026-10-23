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

**InfinityRouter-Konten im Bulk anlegen mit API-Keys — ein New-API-Fork, dessen Reveal einen `X-Security-Proof`-Step-up benötigt, plus ein 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-2-of-them) · [🧪 API nutzen](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

InfinityRouter (`infinityrouter.dev`) ist ein **New-API-Fork** (`QuantumNous/new-api v1.0.0-rc.34+`), verdrahtet auf `subscription_only`-Abrechnung: Die einzigen erhältlichen Tarife sind **39 $ / 69 $ / 129 $ pro Monat**, ein frisches Konto bekommt `quota: 0`, der Check-in ist abgeschaltet und es gibt keinen kostenlosen oder Test-Tarif. Nichts davon hindert die beiden Modelle in der **`free`-Gruppe** des Kontos daran, zu antworten: gemessen am 2026-10-21 liefern `minimax-m3` (Ratio 0.1) und `deepseek-v4.1-flash-1017` (Ratio 0.02) wiederholt `chat-200` mit Usage (`GET /v1/models` → 200, 2 Modelle).

Zwei Hürden stehen zwischen dir und einem Key, und beide wurden gelöst statt umgangen:

1. **Cloudflare Turnstile** auf `GET /api/verification`, `POST /api/user/register` und `POST /api/user/login` (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). Das Token reist im Query-String, ist einmalig verwendbar und an die lösende IP gebunden (`siteverify` `remoteip`) — der Browser, der es erzeugt, muss es also über denselben Exit ausgeben. Das Panel veröffentlicht seinen eigenen Sitekey unter `GET /api/status → data.turnstile_site_key` (gemessen: `0x4AAAAAAFTBBpiFBKxXCi-q`); die CLI steuert ein echtes Headful-Chrome, das an deinen Exit gebunden ist, und lässt die Seite es erzeugen.
2. **Ein „Security-Proof"-Step-up beim Key-Reveal.** `POST /api/token/<id>/key` allein antwortet mit **403 `SECURITY_PROOF_REQUIRED`**. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` liefert `data.proof_token`, und derselbe Reveal, erneut gesendet mit `X-Security-Proof: <proof_token>`, antwortet mit 200 und dem Klartext-Key. Falscher Scope → `SECURITY_PROOF_SCOPE_MISMATCH`, richtiger Scope ohne Context → 400 `SECURITY_CONTEXT_INVALID`, ein JWT statt des Proofs → `SECURITY_PROOF_INVALID`.

Eine weitere Falle kostete am 2026-10-18 sechs Versuche: Der Mail-Code besteht aus **6 HEX-Zeichen**, also liest eine Regex, die nur auf Ziffern prüft, fröhlich die CSS-Farben `404040` / `575757` aus der Nachricht und das Panel antwortet *„Verification code is incorrect or has expired"*. Die CLI verwendet `[0-9a-f]{6}` und ignoriert die Farben.

## 🎁 Free-Tier — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Signup-Quota | **0** (`new_user_quota: 0`) — das Kontingent ist die `free`-Gruppe, kein Guthaben |
| Abrechnungsmodus | `billing_preference: "subscription_only"`; Tarife **Infinity Basic 39 $ / Pro 69 $ / Max 129 $ pro Monat**, kein kostenloser oder Test-Tarif |
| Free-/Test-Tarif | **keiner** (`free_plan: null`) |
| Täglicher Check-in | **aus** (`checkin_enabled: false`) |
| Kontogruppe | `free` — Token-Gruppe `auto` braucht keine Neubindung |
| Ansprechbare Modelle | `minimax-m3` (Ratio **0.1**), `deepseek-v4.1-flash-1017` (Ratio **0.02**) |
| Günstigster Einstieg | `deepseek-v4.1-flash-1017` bei Ratio 0.02 |
| Gruppen-Ratios | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> Das **Gate ist gruppenbasiert, nicht modellbasiert**: Die Modelle der `free`-Gruppe des Kontos werden nicht vorab verbraucht, weshalb sie überhaupt antworten, während die Wallet des Panels leer ist.

> 💡 Der Free-Tier wird von InfinityRouter festgelegt und kann sich ändern. Prüfe die Live-Zahlen auf [infinityrouter.dev](https://infinityrouter.dev) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 2 davon

`GET /v1/models` mit einem frischen Key der `free`-Gruppe antwortet mit **2 Modellen** (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — Ratio 0.1, das Standard-Gate-Modell der CLI
* `deepseek-v4.1-flash-1017` — Ratio 0.02, am günstigsten

Die Gruppe des Keys entscheidet, was `/v1/models` auflistet; `auto_groups` sind auf diesem Panel `basic` / `pro` / `max`, ein bezahlter Tarif würde die Menge also erweitern, aber alles in diesem Repo ist mit der `free`-Gruppe gemessen, in die ein frisches Konto hineingeboren wird.

## 🧪 So nutzt du die API

Die Base-URL ist **`https://infinityrouter.dev/v1`** — OpenAI-kompatibel, also funktioniert alles, was OpenAI spricht (SDKs, Cursor, OpenCode, Kilo Code, …). Anthropic-förmige Clients verwenden den nackten Host mit `/v1/messages`.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* Keys sind **48 Zeichen base62**; die Konsole zeigt sie mit `sk-`-Präfix und **beide Formen werden** auf `/v1` **akzeptiert**
* das `access_token` des Kontos lebt nur **899 s (~15 min)**, und ein erneuter Login braucht wieder Turnstile — die CLI schließt die ganze Kette in einem Lauf ab, statt sie später fortzusetzen
* die CLI ohne Pool laufen zu lassen geht direkt; eine Proxy-Liste lässt jedes Konto auf einem Exit lösen und ausgeben

## 🚀 Ein Befehl

```bash
node src/cli.js --count 10
```

Das ist das ganze Tool. Ein echtes Chrome löst für dich das Cloudflare Turnstile — dieser Schritt ist **automatisch** (`--auto`, und standardmäßig aktiv) — das Konto wird angelegt, sein Key wird erzeugt und jeder Key wird durch einen Live-`chat-200` bewiesen, bevor er `keys.txt` erreicht. Eine `proxies.txt` neben dem Repo wird automatisch aufgegriffen (ein festgelegter Exit pro Konto); ohne sie läuft der Durchlauf DIRECT.

`--dry` gibt den aufgelösten Plan aus — Anzahl, Pool-Größe, Solver-Verfügbarkeit, Modell — und beendet sich, ohne eine einzige Datei anzufassen oder eine Anfrage zu stellen:

```bash
node src/cli.js --dry
```

Lieber ein Menü als Flags? `npm start` (oder `node src/launcher.js`) → **1) Mint keys** → *How many keys? [10]*.

> ⚠️ **Nutzungsbedingungen & Kontorisiko.** Dieses Tool automatisiert die Kontoerstellung und die Ausgabe von API-Keys gegenüber einem Drittanbieter-Panel. Das kann gegen die Nutzungsbedingungen des Panels verstoßen und zur Sperrung von Konten, Keys oder IPs führen. **Automatisierung liegt in deiner eigenen Verantwortung**: Lies die Bedingungen des Anbieters, nutze dein eigenes Postfach und eigene Proxies, und stelle sicher, dass du das dort, wo du lebst, tun darfst, bevor du es ausführst.

## 🛠 Schnellstart

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

Die `--pool`-Datei ist optional: Ohne sie läuft das Tool direkt. Mit ihr wird Chrome einmal pro Versuch gestartet, an den Exit dieses Versuchs gebunden — dieselbe Adresse löst das Turnstile-Token und gibt es aus, was das Panel erzwingt.

### 🖱️ Der Launcher

`npm start` (oder `node src/launcher.js`) ist die Menüform derselben CLI: **1) Mint keys** → *How many keys? [10]* (Enter akzeptiert 10) führt `node src/cli.js --auto --count N` aus. Es fragt nie nach dem Captcha, einem Token oder einem Proxy — `proxies.txt` wird automatisch verwendet, wenn vorhanden. Fehlt Chrome, gibt das Menü den einzeiligen Download-Befehl aus (oder einen klaren Fehler auf einem Headless-Host), und es endet mit einer Übersichtstabelle (live/gesamt, Latenz, Fehlerklassen) plus dem Pfad zu `keys.txt`; Keys, die das Gate nicht bestanden haben, landen in `keys-dead.txt`.

## ✅ Verifiziert funktionierend — jeder Key wird getestet

Laborlauf am 2026-10-21 (Konto-ID 41 / `ina49d3b`, WARP-Exit `104.28.216.172`), vollständige Kette: Turnstile-Token in der Seite erzeugt → `GET /api/verification` 200 `success:true` → Code `33b068` aus einer 6-HEX-Mail gelesen (Zustellung ≤13 s, TTL 10 min) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 s) → Token erstellt → Reveal mit `X-Security-Proof` hochgestuft → Key `lKT1XLW8n2S1…` (48 Zeichen).

Dann das Gate, zweimal erneut ausgeführt: `GET /v1/models` → **200, 2 Modelle**; `minimax-m3` und `deepseek-v4.1-flash-1017` beide **HTTP 200 mit `content:"ok"`**, in der ursprünglichen Probe und in beiden erneuten Verifizierungen. Belege: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), Zustand `providers/infinityrouter/out/mint-20261021-state.json`; Ausarbeitung `proxy-lab/out/infinityrouter-20261021.md`.

> **Qualitäts-Gates.** Jeder Key hier hat einen Live-`chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Keys werden nie ausgeliefert). Router-Kombos folgen derselben Regel auf Modellebene: Ein Eintrag wird
> **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Key oder ein toter Anbieter wird verworfen statt hinzugefügt. Führe den Verify-Schritt jederzeit erneut aus;
> Fehler werden gemeldet, nie versteckt.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

Registrierung, pro Konto:

1. **Seite** — ein echtes (Headful-)Chrome auf einem Exit aus deinem Pool öffnet `/register`. Cloudflares Interstitial wird an die Browsersprache angepasst, also pinnt die CLI `--lang=en-US`.
2. **Sitekey** — `GET /api/status → data.turnstile_site_key` (der eigene Key des Panels; die CLI fällt nur dann auf die gemessene Konstante zurück, wenn `/api/status` nicht erreichbar ist).
3. **Turnstile** — das eigene Widget der Seite erzeugt das Token; es ist an die lösende IP gebunden (`siteverify` `remoteip`), also gilt **Solve-Exit = Spend-Exit**. Die CLI durchläuft das Widget durch geschlossene Shadow Roots, um das Kontrollkästchen zu erreichen.
4. **Postfach** — ein temp.tf hotmail/outlook **Plus-Alias**, eine frische Adresse pro Konto.
5. **Code** — `GET /api/verification?email=&turnstile=` → das Panel mailt `Your verification code is: <strong>26995f</strong>`. Lies **6 HEX-Zeichen** (nicht nur Ziffern: die CSS-Farben `404040`/`575757` stehen in derselben Nachricht); gültig 10 min, zugestellt in ≤13 s.
6. **Register + Login** — `POST /api/user/register?turnstile=` dann `POST /api/user/login?turnstile=` → Console-Bearer-JWT plus das `new_api_refresh`-Cookie (das Refresh-Cookie ist `HttpOnly` auf Pfad `/api/user/auth`, muss also beim Login abgefangen werden).
7. **Key** — Token in `group=free` erstellt, dann über den Step-up offengelegt: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `POST /api/token/<id>/key` mit `X-Security-Proof`.
8. **Gate** — `/v1/chat/completions` zählt nur, wenn `/v1/models` 200 ist, **zwei verschiedene Prompts zwei verschiedene nicht-leere Texte zurückgeben** und ein `get_time`-Tool-Aufruf zurückkommt. Erst danach wird ein Key an `keys.txt` angehängt; ein fehlschlagender wird in `accounts.json` festgehalten und im nächsten Lauf erneut versucht.

> `/api/verify` ist **pro Nutzer** rate-limitiert (429 mit leerem Body und `retry-after` ~440–464 s; gemessen identisch über vier verschiedene Exits, während `/api/user/self` auf jedem 200 blieb). Es ist `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`. Hämmer nicht auf den Reveal ein — einmal erzeugen, dann den Proof wiederverwenden.

## ⚙️ CLI-Optionen

| Flag | Bedeutung |
| --- | --- |
| `--count N` | Konten (= Keys), die erzeugt werden sollen (Standard 1) |
| `--auto` | das Cloudflare Turnstile in einem echten Chrome automatisch lösen (**standardmäßig aktiv**; `--no-auto` schaltet es ab) |
| `--dry` | den aufgelösten Plan ausgeben und beenden (keine Konten, keine Dateien, kein Netzwerk) |
| `--pool FILE` | Exit-Liste, ein Proxy pro Zeile (Standard `proxies.txt`, falls vorhanden; `INFINITYROUTER_POOL`) |
| `--proxy URL` | ein einzelner Exit für jede Anfrage |
| `--exits K` | pro Konto versuchte Exit-Kandidaten (Standard 3) |
| `--model ID` | Modell für das Live-Gate (Standard `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | Token-Gruppe, in der der Key erstellt wird (Standard `free`) |
| `--port N` | Chrome-DevTools-Port (Standard: ein freier) |
| `--browser PATH` | Chrome-Binary (`CHROME_PATH`) |
| `--headless` | **nicht empfohlen** — Cloudflare wird nur in einem sichtbaren Browser gelöst |
| `--keep` | Chrome am Ende des Laufs offen lassen |
| `--verify-only` | jeden Key in `keys.txt` erneut beweisen, nichts erzeugen |

Null Abhängigkeiten; Node.js ≥ 22 für das globale `WebSocket` und `fetch`.

## 🛰️ Hinter einem Proxy

Deine Proxy-Liste ist **optional** — übergib `--pool proxies.txt` und jeder Versuch bekommt sein eigenes Chrome, gestartet mit `--proxy-server` auf dem Exit dieses Versuchs, sodass jede Anfrage, die dieses Konto stellt (Seite, Turnstile-Solve, Panel-Aufrufe, das Chat-Gate), über eine Adresse hinausgeht. Ohne Pool verbindet sich die CLI direkt, was auch der schnellste Weg ist, herauszufinden, dass das Turnstile-Token und seine Ausgabe denselben Exit teilen müssen. `http`-, `socks5`- und `socks4`-Exits werden akzeptiert; Zugangsdaten werden nicht unterstützt.

## 📄 Dateien

| Datei | Was |
| --- | --- |
| `keys.txt` | Keys, die das Live-Gate bestanden haben, einer pro Zeile |
| `accounts.json` | Konto ↔ Exit ↔ Proof-Datensatz (wird laufend geschrieben) |
| `keys-dead.txt` | Keys, die erzeugt wurden, aber das Live-Gate nie bestanden haben — Material für einen erneuten Versuch |
| `src/solver.js` | die Browser- + Cloudflare-Turnstile-Engine hinter `--auto` |
| `repo-spec.json` | diese Packaging-Spezifikation |
| `public-cli.js` | mint / verify (nur Node-Stdlib) |
| `out/evidence-20261021.json` | die gemessene Kette: Gates, Chain, Chat, Modelle, erneute Verifizierungen |
| `out/mint-20261021-state.json` | der eigene Zustand des Mints |

## 🔌 Mit 9Router verbinden

Als benutzerdefinierten OpenAI-kompatiblen Anbieter zu 9Router hinzufügen:

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

`src/connect-9router.js` registriert genau das, und der Launcher bietet es an. Anthropic-förmige Clients zeigen auf den nackten Host (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 Mit OmniRoute verbinden

Als benutzerdefinierten OpenAI-kompatiblen Anbieter zu OmniRoute hinzufügen:

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

`src/connect-omniroute.js` registriert genau das, und der Launcher bietet es an. Anthropic-förmige Clients zeigen auf den nackten Host (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 Was ein Key dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 Was der Anbieter gibt | Cloudflare Turnstile in einem echten Chrome bezwungen, ein Security-Proof-Step-up beim Key-Reveal ausgegeben — und die `free`-Gruppe antwortet mit chat-200 ganz ohne Quota |
| 🔑 Was ein Key dir bringt | ein API-Key, der auf sein eigenes Konto beschränkt ist: die 2 Modell-IDs am untenstehenden Endpunkt, im Rahmen der Limits deines Tarifs. Die Quota liegt am **Konto**, weshalb dieses Tool genau ein Konto pro Key anlegt |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Deine Daten | nur infinityrouter.dev und das von dir konfigurierte Postfach-Backend werden kontaktiert; Keys bleiben auf deiner Maschine |

## 🐞 Issues

* **Die Gruppe, nicht das Modell, entscheidet über den Zugang.** Die `free`-Gruppe des Kontos ist es, die die beiden Modelle antworten lässt, während `quota` 0 ist und die Abrechnung `subscription_only` lautet. Ein in einer anderen Gruppe erstellter Key sieht nicht dieselbe Menge.
* **`/api/verify` ist pro Nutzer rate-limitiert.** Ein 429 dort kommt mit **leerem Body** und einem `retry-after` um 440–464 s zurück — dieselbe TTL von jedem Exit, also setzt das Rotieren von Proxies sie nicht zurück. Warte sie ab; der Reveal selbst ist in Ordnung.
* **Eine Regex, die nur auf Ziffern prüft, ist falsch.** Der Code besteht aus 6 HEX-Zeichen, und die Nachricht enthält CSS-Farben (`404040`, `575757`), die ein `\d{6}`-Muster bereitwillig akzeptiert — dieser Fehler kostete am 2026-10-18 sechs Versuche.
* **Turnstile-Token sind IP-gebunden und einmalig verwendbar.** In einem Netzwerk lösen und aus einem anderen ausgeben schlägt mit `Turnstile verification failed` fehl; die CLI trennt sie nie.
* **Die Sitzung ist kurz.** Das `access_token` der Konsole hält 899 s, und ein erneuter Login braucht ein frisches Turnstile-Token, also muss ein Lauf, der mitten in der Kette untätig wird, von vorn beginnen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>