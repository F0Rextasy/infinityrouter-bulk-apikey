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

**API 키로 InfinityRouter 계정을 대량 생성하세요 — 공개(reveal)에 `X-Security-Proof` 단계적 인증이 필요한 New API 포크이며, 9Router 커넥터를 포함합니다.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-2-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

InfinityRouter(`infinityrouter.dev`)는 `subscription_only` 과금에 연결된 **New API 포크**(`QuantumNous/new-api v1.0.0-rc.34+`)입니다. 판매 중인 유일한 요금제는 **월 $39 / $69 / $129**이고, 새 계정은 `quota: 0`을 받으며, 출석 체크는 꺼져 있고 무료 또는 체험 요금제가 없습니다. 그렇다고 해서 계정 자체의 **`free` 그룹**에 있는 두 모델이 응답하지 못하는 것은 아닙니다. 2026-10-21에 측정한 결과, `minimax-m3`(비율 0.1)와 `deepseek-v4.1-flash-1017`(비율 0.02)는 사용량과 함께 `chat-200`을 반복적으로 반환합니다(`GET /v1/models` → 200, 모델 2개).

당신과 키 사이에는 두 개의 관문이 있고, 둘 다 건너뛰지 않고 해결되었습니다:

1. **Cloudflare Turnstile** — `GET /api/verification`, `POST /api/user/register`, `POST /api/user/login`에 적용됩니다(`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). 토큰은 쿼리 문자열로 전달되고, 일회용이며, 해결한 IP(`siteverify` `remoteip`)에 묶여 있습니다 — 따라서 토큰을 발급한 브라우저가 동일한 출구에서 사용해야 합니다. 패널은 자체 sitekey를 `GET /api/status → data.turnstile_site_key`에 공개합니다(측정값 `0x4AAAAAAFTBBpiFBKxXCi-q`). CLI는 당신의 출구에 고정된 실제 헤드풀 Chrome을 구동하고 페이지가 토큰을 발급하도록 합니다.
2. **키 공개(reveal) 시의 "보안 증명(security proof)" 단계적 인증.** `POST /api/token/<id>/key`만 호출하면 **403 `SECURITY_PROOF_REQUIRED`**가 반환됩니다. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}`는 `data.proof_token`을 반환하고, `X-Security-Proof: <proof_token>`과 함께 재생한 동일한 공개 요청은 200과 평문 키를 반환합니다. 잘못된 scope → `SECURITY_PROOF_SCOPE_MISMATCH`, context 없이 올바른 scope → 400 `SECURITY_CONTEXT_INVALID`, 증명 대신 JWT를 넣으면 → `SECURITY_PROOF_INVALID`.

2026-10-18에 여섯 번의 시도를 낭비하게 만든 함정이 하나 더 있습니다: 메일 코드는 **6자리 HEX 문자**이므로, 숫자만 매칭하는 정규식은 메시지에서 CSS 색상 `404040` / `575757`을 손쉽게 읽어내고 패널은 *"Verification code is incorrect or has expired"*라고 응답합니다. CLI는 `[0-9a-f]{6}`을 사용하고 색상은 무시합니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 가입 쿼터 | **0** (`new_user_quota: 0`) — 허용량은 잔액이 아니라 `free` 그룹입니다 |
| 과금 모드 | `billing_preference: "subscription_only"`; 요금제 **Infinity Basic $39 / Pro $69 / Max $129 월간**, 무료 또는 체험 요금제 없음 |
| 무료/체험 요금제 | **없음** (`free_plan: null`) |
| 일일 출석 체크 | **꺼짐** (`checkin_enabled: false`) |
| 계정 그룹 | `free` — 토큰 그룹 `auto`는 재바인딩이 필요 없습니다 |
| 대화 가능한 모델 | `minimax-m3` (비율 **0.1**), `deepseek-v4.1-flash-1017` (비율 **0.02**) |
| 최저 진입 | `deepseek-v4.1-flash-1017`, 비율 0.02 |
| 그룹 비율 | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> **관문은 모델 기반이 아니라 그룹 기반입니다**: 계정의 `free` 그룹 모델은 사전 소비되지 않으므로, 패널 자체의 지갑이 비어 있어도 응답하는 것입니다.

> 💡 무료 티어는 InfinityRouter가 설정하며 변경될 수 있습니다. 실시간 수치는 [infinityrouter.dev](https://infinityrouter.dev)에서 확인하세요 — 그리고 도구 자체의 관문이 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 딱 2개

새 `free` 그룹 키로 `GET /v1/models`를 호출하면 **모델 2개**가 응답합니다(`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — 비율 0.1, CLI의 기본 관문 모델
* `deepseek-v4.1-flash-1017` — 비율 0.02, 최저가

키의 그룹이 `/v1/models`에 나열되는 항목을 결정합니다. 이 패널의 `auto_groups`는 `basic` / `pro` / `max`이므로 유료 요금제는 범위를 넓히겠지만, 이 저장소의 모든 것은 새 계정이 태어나는 `free` 그룹으로 측정되었습니다.

## 🧪 API 사용 방법

베이스 URL은 **`https://infinityrouter.dev/v1`**입니다 — OpenAI 호환되므로 OpenAI를 지원하는 모든 것(SDK, Cursor, OpenCode, Kilo Code, …)이 작동합니다. Anthropic 형태의 클라이언트는 베어 호스트와 `/v1/messages`를 사용합니다.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* 키는 **48자 base62**입니다; 콘솔은 `sk-` 접두사와 함께 표시하며 **두 형태 모두** `/v1`에서 허용됩니다
* 계정의 `access_token`은 **899초(~15분)**만 유지되며, 재로그인에는 Turnstile이 다시 필요합니다 — CLI는 나중에 재개하는 대신 한 번의 실행으로 전체 체인을 완료합니다
* 풀 없이 CLI를 실행하면 직접 연결됩니다; 프록시 목록을 사용하면 각 계정이 하나의 출구에서 해결하고 사용합니다

## 🚀 명령어 하나

```bash
node src/cli.js --count 10
```

이것이 도구의 전부입니다. 실제 Chrome 하나가 Cloudflare Turnstile을 대신 통과합니다 — 이 단계는 **자동**입니다(`--auto`, 기본값으로 켜져 있음) — 계정이 생성되고, 키가 발급되며, 모든 키는 `keys.txt`에 도달하기 전에 실제 `chat-200`으로 증명됩니다. 저장소 옆의 `proxies.txt`는 자동으로 인식됩니다(계정당 하나의 고정 출구); 없으면 실행은 DIRECT로 진행됩니다.

`--dry`는 해석된 계획 — 개수, 풀 크기, 솔버 가용성, 모델 — 을 출력하고 파일을 건드리거나 요청을 보내지 않고 종료합니다:

```bash
node src/cli.js --dry
```

플래그보다 메뉴를 선호하시나요? `npm start`(또는 `node src/launcher.js`) → **1) Mint keys** → *How many keys? [10]*.

> ⚠️ **약관 및 계정 위험.** 이 도구는 제3자 패널에 대해 계정 생성과 API 키 발급을 자동화합니다. 이는 패널의 서비스 약관을 위반할 수 있으며 계정, 키 또는 IP가 차단될 수 있습니다. **자동화는 본인의 책임입니다**: 제공자의 약관을 읽고, 자신의 받은편지함과 프록시를 사용하며, 실행하기 전에 거주 지역에서 이것이 허용되는지 확인하세요.

## 🛠 빠른 시작

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

`--pool` 파일은 선택 사항입니다: 없으면 도구는 직접 연결됩니다. 있으면 Chrome이 시도마다 하나의 브라우저로 실행되며 해당 시도의 출구에 고정됩니다 — 동일한 주소가 Turnstile 토큰을 해결하고 사용하며, 패널이 이를 강제합니다.

### 🖱️ 런처

`npm start`(또는 `node src/launcher.js`)는 동일한 CLI의 메뉴 형태입니다: **1) Mint keys** → *How many keys? [10]* (Enter를 누르면 10이 허용됨)는 `node src/cli.js --auto --count N`을 실행합니다. 캡차, 토큰 또는 프록시에 대해 묻지 않습니다 — `proxies.txt`가 있으면 자동으로 사용됩니다. Chrome이 없으면 메뉴가 한 줄 다운로드 명령을 출력하고(또는 헤드리스 호스트에서는 명확한 오류를 표시), 요약 표(라이브/전체, 지연 시간, 오류 클래스)와 `keys.txt` 경로로 끝납니다; 관문을 통과하지 못한 키는 `keys-dead.txt`에 들어갑니다.

## ✅ 검증됨 — 모든 키가 테스트됩니다

2026-10-21 랩 실행(계정 id 41 / `ina49d3b`, WARP 출구 `104.28.216.172`), 전체 체인: 페이지 내에서 Turnstile 토큰 발급 → `GET /api/verification` 200 `success:true` → 6-HEX 메일에서 코드 `33b068` 읽기(전달 ≤13초, TTL 10분) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899초) → 토큰 생성 → `X-Security-Proof`로 공개 단계적 인증 → 키 `lKT1XLW8n2S1…` (48자).

그런 다음 관문, 두 번 재실행: `GET /v1/models` → **200, 모델 2개**; `minimax-m3`와 `deepseek-v4.1-flash-1017` 모두 **HTTP 200, `content:"ok"`**, 최초 프로브와 두 번의 재검증 모두에서. 증거: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), 상태 `providers/infinityrouter/out/mint-20261021-state.json`; 기록 `proxy-lab/out/infinityrouter-20261021.md`.

> **품질 관문.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실제 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 조합은 모델 수준에서 동일한 규칙을 따릅니다: 항목은
> **모델이 `chat-200`을 응답하고 도구를 호출할 수 있는 경우에만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 언제든지 검증 단계를 재실행하세요;
> 실패는 보고되며 절대 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

계정별 가입:

1. **페이지** — 당신의 풀에서 하나의 출구에 있는 실제 (헤드풀) Chrome이 `/register`를 엽니다. Cloudflare의 인터스티셜은 브라우저 언어에 맞춰 현지화되므로, CLI는 `--lang=en-US`를 고정합니다.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (패널 자체의 키; CLI는 `/api/status`에 도달할 수 없는 경우에만 측정된 상수로 폴백합니다).
3. **Turnstile** — 페이지 자체의 위젯이 토큰을 발급합니다; 토큰은 해결한 IP(`siteverify` `remoteip`)에 묶여 있으므로 **해결 출구 = 사용 출구**입니다. CLI는 닫힌 섀도 루트를 통해 위젯을 순회하여 체크박스에 도달합니다.
4. **메일박스** — temp.tf hotmail/outlook **플러스 별칭**, 계정당 하나의 새 주소.
5. **코드** — `GET /api/verification?email=&turnstile=` → 패널이 `Your verification code is: <strong>26995f</strong>`를 메일로 보냅니다. **6 HEX 문자**를 읽으세요(숫자만이 아님: CSS 색상 `404040`/`575757`이 같은 메시지에 있습니다); 10분간 유효, ≤13초 내 전달.
6. **register + login** — `POST /api/user/register?turnstile=` 그런 다음 `POST /api/user/login?turnstile=` → 콘솔 Bearer JWT와 `new_api_refresh` 쿠키(리프레시 쿠키는 경로 `/api/user/auth`에서 `HttpOnly`이므로 로그인 시 캡처해야 합니다).
7. **키** — `group=free`로 토큰 생성, 그런 다음 단계적 인증을 통해 공개: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `X-Security-Proof`와 함께 `POST /api/token/<id>/key`.
8. **관문** — `/v1/chat/completions`는 `/v1/models`가 200이고, **두 개의 서로 다른 프롬프트가 두 개의 서로 다른 비어 있지 않은 텍스트를 반환**하며, `get_time` 도구 호출이 돌아올 때만 인정됩니다. 키는 그 후에만 `keys.txt`에 추가됩니다; 실패한 키는 `accounts.json`에 기록되고 다음 실행에서 재시도됩니다.

> `/api/verify`는 **사용자별**로 속도 제한됩니다(빈 본문과 `retry-after` ~440–464초의 429; 네 개의 서로 다른 출구에서 동일하게 측정되었으며 `/api/user/self`는 각각에서 200을 유지했습니다). 이는 `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`입니다. 공개를 두들기지 마세요 — 한 번 발급하고 증명을 재사용하세요.

## ⚙️ CLI 옵션

| 플래그 | 의미 |
| --- | --- |
| `--count N` | 발급할 계정(= 키) 수 (기본 1) |
| `--auto` | 실제 Chrome에서 Cloudflare Turnstile을 자동으로 해결 (**기본 켜짐**; `--no-auto`로 해제) |
| `--dry` | 해석된 계획을 출력하고 종료 (계정 없음, 파일 없음, 네트워크 없음) |
| `--pool FILE` | 출구 목록, 한 줄에 프록시 하나 (있으면 기본 `proxies.txt`; `INFINITYROUTER_POOL`) |
| `--proxy URL` | 모든 요청에 단일 출구 |
| `--exits K` | 계정당 시도할 출구 후보 (기본 3) |
| `--model ID` | 실제 관문에 사용되는 모델 (기본 `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | 키가 생성되는 토큰 그룹 (기본 `free`) |
| `--port N` | Chrome DevTools 포트 (기본: 사용 가능한 포트) |
| `--browser PATH` | Chrome 바이너리 (`CHROME_PATH`) |
| `--headless` | **권장하지 않음** — Cloudflare는 보이는 브라우저에서만 통과됩니다 |
| `--keep` | 실행이 끝나면 Chrome을 열어 둠 |
| `--verify-only` | `keys.txt`의 모든 키를 재증명, 아무것도 발급하지 않음 |

의존성 없음; 전역 `WebSocket`과 `fetch`를 위해 Node.js ≥ 22.

## 🛰️ 프록시 뒤에서

프록시 목록은 **선택 사항**입니다 — `--pool proxies.txt`를 전달하면 각 시도가 해당 시도의 출구에 `--proxy-server`로 실행된 자체 Chrome을 받으므로, 그 계정이 만드는 모든 요청(페이지, Turnstile 해결, 패널 호출, 채팅 관문)이 하나의 주소를 통해 나갑니다. 풀이 없으면 CLI는 직접 연결하며, 이는 Turnstile 토큰과 그 사용이 출구를 공유해야 한다는 것을 알아내는 가장 빠른 방법이기도 합니다. `http`, `socks5`, `socks4` 출구가 허용됩니다; 자격 증명은 지원되지 않습니다.

## 📄 파일

| 파일 | 내용 |
| --- | --- |
| `keys.txt` | 실제 관문을 통과한 키, 한 줄에 하나 |
| `accounts.json` | 계정 ↔ 출구 ↔ 증명 기록 (진행하면서 기록됨) |
| `keys-dead.txt` | 발급되었지만 실제 관문을 통과하지 못한 키 — 재시도 자료 |
| `src/solver.js` | `--auto` 뒤의 브라우저 + Cloudflare Turnstile 엔진 |
| `repo-spec.json` | 이 패키징 명세 |
| `public-cli.js` | 발급 / 검증 (node 표준 라이브러리만) |
| `out/evidence-20261021.json` | 측정된 체인: 관문, 체인, 채팅, 모델, 재검증 |
| `out/mint-20261021-state.json` | 발급 자체의 상태 |

## 🔌 9Router에 연결

9Router에 사용자 정의 OpenAI 호환 제공자로 추가:

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

`src/connect-9router.js`가 정확히 이것을 등록하며, 런처가 이를 제공합니다. Anthropic 형태의 클라이언트는 베어 호스트(`https://infinityrouter.dev`, `/v1/messages`)를 가리킵니다.

## 🔌 OmniRoute에 연결

OmniRoute에 사용자 정의 OpenAI 호환 제공자로 추가:

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

`src/connect-omniroute.js`가 정확히 이것을 등록하며, 런처가 이를 제공합니다. Anthropic 형태의 클라이언트는 베어 호스트(`https://infinityrouter.dev`, `/v1/messages`)를 가리킵니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 제공자가 주는 것 | 실제 Chrome에서 Cloudflare Turnstile을 통과하고, 키 공개에 보안 증명 단계적 인증을 사용 — 그리고 `free` 그룹이 쿼터 없이 chat-200을 응답합니다 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 API 키 하나: 아래 엔드포인트의 모델 id 2개, 당신의 요금제 한도 내에서. 쿼터는 **계정**에 있으므로, 이 도구가 키당 하나의 계정을 만드는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 당신의 데이터 | infinityrouter.dev와 당신이 구성한 받은편지함 백엔드만 접촉됩니다; 키는 당신의 머신에 남습니다 |

## 🐞 이슈

* **접근을 결정하는 것은 모델이 아니라 그룹입니다.** 계정의 `free` 그룹이 `quota`가 0이고 과금이 `subscription_only`인 동안 두 모델이 응답하게 만드는 것입니다. 다른 그룹에서 생성된 키는 동일한 집합을 보지 못합니다.
* **`/api/verify`는 사용자별로 속도 제한됩니다.** 그곳의 429는 **빈 본문**과 약 440–464초의 `retry-after`와 함께 돌아옵니다 — 모든 출구에서 동일한 TTL이므로 프록시를 회전해도 재설정되지 않습니다. 기다리세요; 공개 자체는 괜찮습니다.
* **숫자만 매칭하는 메일 정규식은 잘못되었습니다.** 코드는 6 HEX 문자이며 메시지에는 `\d{6}` 패턴이 손쉽게 받아들일 CSS 색상(`404040`, `575757`)이 있습니다 — 그 실수는 2026-10-18에 여섯 번의 시도를 태웠습니다.
* **Turnstile 토큰은 IP에 묶여 있고 일회용입니다.** 한 네트워크에서 해결하고 다른 곳에서 사용하면 `Turnstile verification failed`로 실패합니다; CLI는 절대 이들을 분리하지 않습니다.
* **세션은 짧습니다.** 콘솔 `access_token`은 899초 동안 지속되고 재로그인에는 새 Turnstile 토큰이 필요하므로, 체인 중간에 유휴 상태가 된 실행은 처음부터 다시 시작해야 합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>