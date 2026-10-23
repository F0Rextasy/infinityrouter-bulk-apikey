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

**Массовое создание аккаунтов InfinityRouter с API-ключами — форк New API, раскрытие ключа в котором требует шага подтверждения `X-Security-Proof`, плюс коннектор для 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-2-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

InfinityRouter (`infinityrouter.dev`) — это **форк New API** (`QuantumNous/new-api v1.0.0-rc.34+`), подключённый к биллингу `subscription_only`: единственные доступные тарифы — **$39 / $69 / $129 в месяц**, новый аккаунт получает `quota: 0`, ежедневная отметка отключена, а бесплатного или пробного тарифа нет. Ничто из этого не мешает двум моделям из собственной **группы `free`** аккаунта отвечать: по измерениям от 2026-10-21, `minimax-m3` (коэффициент 0.1) и `deepseek-v4.1-flash-1017` (коэффициент 0.02) возвращают `chat-200` с usage, и так повторяется (`GET /v1/models` → 200, 2 модели).

Между вами и ключом стоят два барьера, и оба были решены, а не пропущены:

1. **Cloudflare Turnstile** на `GET /api/verification`, `POST /api/user/register` и `POST /api/user/login` (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). Токен передаётся в строке запроса, одноразовый и привязан к IP, на котором был решён (`siteverify` `remoteip`) — поэтому браузер, который его создаёт, должен потратить его с того же выхода. Панель публикует свой sitekey на `GET /api/status → data.turnstile_site_key` (измерено `0x4AAAAAAFTBBpiFBKxXCi-q`); CLI запускает настоящий Chrome с графическим интерфейсом, привязанный к вашему выходу, и позволяет странице создать токен.
2. **Шаг подтверждения «security proof» при раскрытии ключа.** Один только `POST /api/token/<id>/key` отвечает **403 `SECURITY_PROOF_REQUIRED`**. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` возвращает `data.proof_token`, и тот же запрос на раскрытие, повторённый с `X-Security-Proof: <proof_token>`, отвечает 200 и открытым текстом ключа. Неверный scope → `SECURITY_PROOF_SCOPE_MISMATCH`, верный scope без context → 400 `SECURITY_CONTEXT_INVALID`, JWT вместо proof → `SECURITY_PROOF_INVALID`.

Ещё одна ловушка стоила шести попыток 2026-10-18: почтовый код состоит из **6 HEX-символов**, поэтому регулярное выражение только для цифр с радостью вычитывает из сообщения CSS-цвета `404040` / `575757`, и панель отвечает *«Verification code is incorrect or has expired»*. CLI использует `[0-9a-f]{6}` и игнорирует цвета.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Квота при регистрации | **0** (`new_user_quota: 0`) — лимит обеспечивает группа `free`, а не баланс |
| Режим биллинга | `billing_preference: "subscription_only"`; тарифы **Infinity Basic $39 / Pro $69 / Max $129 в месяц**, бесплатного или пробного тарифа нет |
| Бесплатный/пробный тариф | **нет** (`free_plan: null`) |
| Ежедневная отметка | **отключена** (`checkin_enabled: false`) |
| Группа аккаунта | `free` — группе токена `auto` не требуется перепривязка |
| Доступные модели | `minimax-m3` (коэффициент **0.1**), `deepseek-v4.1-flash-1017` (коэффициент **0.02**) |
| Самый дешёвый вход | `deepseek-v4.1-flash-1017` с коэффициентом 0.02 |
| Коэффициенты групп | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> **Ограничение основано на группе, а не на модели**: модели группы `free` аккаунта не списываются заранее, поэтому они вообще отвечают, пока собственный кошелёк панели пуст.

> 💡 Бесплатный тариф задаётся InfinityRouter и может измениться. Проверяйте актуальные цифры на [infinityrouter.dev](https://infinityrouter.dev) — и пусть решение принимает собственный гейт инструмента:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 2 из них

`GET /v1/models` со свежим ключом группы `free` отвечает **2 модели** (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — коэффициент 0.1, модель гейта по умолчанию в CLI
* `deepseek-v4.1-flash-1017` — коэффициент 0.02, самая дешёвая

Группа ключа определяет, что перечисляет `/v1/models`; `auto_groups` на этой панели — `basic` / `pro` / `max`, поэтому платный тариф расширил бы набор, но всё в этом репозитории измерено с группой `free`, в которую рождается новый аккаунт.

## 🧪 Как использовать API

Базовый URL — **`https://infinityrouter.dev/v1`** — совместим с OpenAI, поэтому работает всё, что говорит на OpenAI (SDK, Cursor, OpenCode, Kilo Code, …). Клиенты в стиле Anthropic используют голый хост с `/v1/messages`.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* ключи — **48-символьные base62**; консоль показывает их с префиксом `sk-`, и **обе формы принимаются** на `/v1`
* `access_token` аккаунта живёт всего **899 с (~15 мин)**, а повторный вход снова требует Turnstile — CLI завершает всю цепочку за один запуск, а не возобновляет её позже
* запуск CLI без пула идёт напрямую; список прокси заставляет каждый аккаунт решать и тратить на одном выходе

## 🛠 Быстрый старт

```bash

# 1) one account + one key, gated end-to-end (real Chrome + Cloudflare Turnstile)
node src/cli.js --count 1 --pool proxies.txt

# 2) re-prove every key already in keys.txt (models + two distinct chats + a get_time tool call)
node src/cli.js --verify-only

# 3) talk to it
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

Файл `--pool` необязателен: без него инструмент работает напрямую. С ним Chrome запускается по одному браузеру на попытку, привязанному к выходу этой попытки — тот же адрес решает Turnstile-токен и тратит его, чего и требует панель.

### 🖱️ Лаунчер

`src/launcher.js` (с тем же баннером, что и в этом README) запрашивает несколько ответов, необходимых для создания, — сколько аккаунтов, список выходов, модель гейта — запоминает их в `launcher.config.json`, а затем запускает `src/cli.js`. Это тот же CLI, только без запоминания флагов.

## ✅ Проверено в работе — каждый ключ протестирован

Лабораторный запуск 2026-10-21 (id аккаунта 41 / `ina49d3b`, выход WARP `104.28.216.172`), полная цепочка: Turnstile-токен создан на странице → `GET /api/verification` 200 `success:true` → код `33b068` прочитан из 6-HEX письма (доставка ≤13 с, TTL 10 мин) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 с) → токен создан → раскрытие прошло шаг подтверждения с `X-Security-Proof` → ключ `lKT1XLW8n2S1…` (48 символов).

Затем гейт, повторённый дважды: `GET /v1/models` → **200, 2 модели**; `minimax-m3` и `deepseek-v4.1-flash-1017` оба **HTTP 200 с `content:"ok"`**, в исходной проверке и в обеих повторных верификациях. Доказательства: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), состояние `providers/infinityrouter/out/mint-20261021-state.json`; отчёт `proxy-lab/out/infinityrouter-20261021.md`.

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200`, прежде чем был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг верификации в любое время;
> сбои сообщаются, а не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

Регистрация, для каждого аккаунта:

1. **страница** — настоящий (с графическим интерфейсом) Chrome на одном выходе из вашего пула открывает `/register`. Интерстициал Cloudflare локализуется под язык браузера, поэтому CLI фиксирует `--lang=en-US`.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (собственный ключ панели; CLI откатывается к измеренной константе только если `/api/status` недоступен).
3. **Turnstile** — собственный виджет страницы создаёт токен; он привязан к IP, на котором был решён (`siteverify` `remoteip`), поэтому **выход решения = выход траты**. CLI проходит виджет через закрытые shadow root, чтобы добраться до чекбокса.
4. **почтовый ящик** — hotmail/outlook **plus-alias** на temp.tf, по одному свежему адресу на аккаунт.
5. **код** — `GET /api/verification?email=&turnstile=` → панель отправляет письмо `Your verification code is: <strong>26995f</strong>`. Читайте **6 HEX-символов** (не только цифры: CSS-цвета `404040`/`575757` находятся в том же сообщении); действителен 10 мин, доставляется за ≤13 с.
6. **регистрация + вход** — `POST /api/user/register?turnstile=`, затем `POST /api/user/login?turnstile=` → консольный Bearer JWT плюс cookie `new_api_refresh` (refresh-cookie имеет `HttpOnly` на пути `/api/user/auth`, поэтому его нужно захватить при входе).
7. **ключ** — токен создан в `group=free`, затем раскрыт через шаг подтверждения: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `POST /api/token/<id>/key` с `X-Security-Proof`.
8. **гейт** — `/v1/chat/completions` засчитывается только если `/v1/models` возвращает 200, **два разных запроса возвращают два разных непустых текста**, и приходит вызов инструмента `get_time`. Ключ добавляется в `keys.txt` только после этого; неудачный записывается в `accounts.json` и повторяется в следующем запуске.

> `/api/verify` имеет ограничение частоты **на пользователя** (429 с пустым телом и `retry-after` ~440–464 с; измерено одинаковым на четырёх разных выходах, тогда как `/api/user/self` оставался 200 на каждом). Это `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`. Не долбите раскрытие — создайте один раз, затем переиспользуйте proof.

## ⚙️ Опции CLI

| флаг | значение |
| --- | --- |
| `--count N` | сколько аккаунтов (= ключей) создать (по умолчанию 1) |
| `--pool FILE` | список выходов, по одному прокси на строку (по умолчанию `proxies.txt`, если есть; `INFINITYROUTER_POOL`) |
| `--proxy URL` | единственный выход для всех запросов |
| `--exits K` | кандидатов-выходов, пробуемых на аккаунт (по умолчанию 3) |
| `--model ID` | модель, используемая для живого гейта (по умолчанию `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | группа токена, в которой создаётся ключ (по умолчанию `free`) |
| `--port N` | порт Chrome DevTools (по умолчанию: свободный) |
| `--browser PATH` | бинарник Chrome (`CHROME_PATH`) |
| `--headless` | **не рекомендуется** — Cloudflare проходит только в видимом браузере |
| `--keep` | оставить Chrome открытым после завершения запуска |
| `--verify-only` | перепроверить каждый ключ в `keys.txt`, ничего не создавая |

Ноль зависимостей; Node.js ≥ 22 для глобальных `WebSocket` и `fetch`.

## 🛰️ За прокси

Ваш список прокси **необязателен** — передайте `--pool proxies.txt`, и каждая попытка получит собственный Chrome, запущенный с `--proxy-server` на выходе этой попытки, так что каждый запрос этого аккаунта (страница, решение Turnstile, вызовы панели, чат-гейт) уходит через один адрес. Без пула CLI подключается напрямую, что также самый быстрый способ выяснить, что Turnstile-токен и его трата должны использовать один выход. Принимаются выходы `http`, `socks5` и `socks4`; учётные данные не поддерживаются.

## 📄 Файлы

| файл | что |
| --- | --- |
| `keys.txt` | ключи, прошедшие живой гейт, по одному на строку |
| `accounts.json` | запись аккаунт ↔ выход ↔ proof (пишется по ходу) |
| `repo-spec.json` | эта спецификация упаковки |
| `public-cli.js` | создание / верификация (только stdlib node) |
| `out/evidence-20261021.json` | измеренная цепочка: гейты, цепочка, чат, модели, повторные верификации |
| `out/mint-20261021-state.json` | собственное состояние создания |

## 🔌 Подключение к 9Router

Добавьте в 9Router как пользовательского провайдера, совместимого с OpenAI:

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

`src/connect-9router.js` регистрирует именно это, и лаунчер предлагает это. Клиенты в стиле Anthropic указывают на голый хост (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 Подключение к OmniRoute

Добавьте в OmniRoute как пользовательского провайдера, совместимого с OpenAI:

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

`src/connect-omniroute.js` регистрирует именно это, и лаунчер предлагает это. Клиенты в стиле Anthropic указывают на голый хост (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 Что даёт провайдер | Cloudflare Turnstile побеждён в настоящем Chrome, шаг подтверждения security proof пройден при раскрытии ключа — и группа `free` отвечает chat-200 вообще без квоты |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к собственному аккаунту: 2 id моделей на указанном ниже эндпоинте, в пределах лимитов вашего тарифа. Квота живёт на **аккаунте**, и именно поэтому этот инструмент создаёт по одному аккаунту на ключ |
| 🌐 Форма API | Совместим с OpenAI: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Ваши данные | связывается только infinityrouter.dev и настроенный вами почтовый бэкенд; ключи остаются на вашей машине |

## 🐞 Проблемы

* **Доступ определяет группа, а не модель.** Именно группа `free` аккаунта заставляет две модели отвечать, пока `quota` равна 0, а биллинг — `subscription_only`. Ключ, созданный в другой группе, не увидит тот же набор.
* **`/api/verify` имеет ограничение частоты на пользователя.** 429 там возвращается с **пустым телом** и `retry-after` около 440–464 с — одинаковый TTL с любого выхода, поэтому ротация прокси его не сбрасывает. Переждите; само раскрытие в порядке.
* **Регулярное выражение только для цифр в письме неверно.** Код состоит из 6 HEX-символов, а сообщение содержит CSS-цвета (`404040`, `575757`), которые шаблон `\d{6}` с радостью примет — эта ошибка сожгла шесть попыток 2026-10-18.
* **Turnstile-токены привязаны к IP и одноразовы.** Решение в одной сети и трата из другой завершается ошибкой `Turnstile verification failed`; CLI никогда их не разделяет.
* **Сессия коротка.** Консольный `access_token` живёт 899 с, а повторный вход требует свежего Turnstile-токена, поэтому запуск, простаивающий в середине цепочки, должен начинаться заново.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>