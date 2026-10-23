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

**批量创建带 API 密钥的 InfinityRouter 账户 —— 一个 New API 分支，其密钥揭示需要 `X-Security-Proof` 逐步验证，另附一个 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-2-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

InfinityRouter（`infinityrouter.dev`）是一个 **New API 分支**（`QuantumNous/new-api v1.0.0-rc.34+`），接入了 `subscription_only` 计费模式：唯一在售的方案是 **每月 $39 / $69 / $129**，新账户的 `quota: 0`，签到功能已关闭，也没有免费或试用方案。但这一切都挡不住账户自带的 **`free` 分组**中的两个模型作出响应：在 2026-10-21 实测，`minimax-m3`（倍率 0.1）和 `deepseek-v4.1-flash-1017`（倍率 0.02）可反复返回带用量的 `chat-200`（`GET /v1/models` → 200，2 个模型）。

你和密钥之间横着两道关卡，两者都是被解决而非绕过的：

1. **Cloudflare Turnstile**，出现在 `GET /api/verification`、`POST /api/user/register` 和 `POST /api/user/login` 上（`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`）。该令牌通过查询字符串传递，一次性使用，并绑定到求解时的 IP（`siteverify` 的 `remoteip`）—— 因此生成它的浏览器必须从同一出口消费它。面板在 `GET /api/status → data.turnstile_site_key` 处公布自己的 sitekey（实测为 `0x4AAAAAAFTBBpiFBKxXCi-q`）；CLI 会驱动一个真实的带界面 Chrome，固定到你的出口，让页面自行生成令牌。
2. **密钥揭示时的"安全证明"逐步验证。** 单独调用 `POST /api/token/<id>/key` 会返回 **403 `SECURITY_PROOF_REQUIRED`**。`POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` 返回 `data.proof_token`，再用 `X-Security-Proof: <proof_token>` 重放同一揭示请求，会返回 200 和明文密钥。作用域错误 → `SECURITY_PROOF_SCOPE_MISMATCH`，作用域正确但缺少上下文 → 400 `SECURITY_CONTEXT_INVALID`，用 JWT 代替证明 → `SECURITY_PROOF_INVALID`。

2026-10-18 还有一个陷阱耗费了六次尝试：邮件验证码是 **6 个十六进制字符**，所以仅匹配数字的正则表达式会从邮件中读到 CSS 颜色 `404040` / `575757`，面板则回复 *"Verification code is incorrect or has expired"*。CLI 采用 `[0-9a-f]{6}` 并忽略颜色值。

## 🎁 免费额度 —— 你能得到多少

| 项目 | 值 |
| --- | --- |
| 注册额度 | **0**（`new_user_quota: 0`）—— 额度来自 `free` 分组，而非余额 |
| 计费模式 | `billing_preference: "subscription_only"`；方案为 **Infinity Basic $39 / Pro $69 / Max $129 每月**，无免费或试用方案 |
| 免费/试用方案 | **无**（`free_plan: null`） |
| 每日签到 | **关闭**（`checkin_enabled: false`） |
| 账户分组 | `free` —— 令牌分组 `auto` 无需重新绑定 |
| 可对话模型 | `minimax-m3`（倍率 **0.1**）、`deepseek-v4.1-flash-1017`（倍率 **0.02**） |
| 最低门槛 | `deepseek-v4.1-flash-1017`，倍率 0.02 |
| 分组倍率 | `free` 1、`basic` 1、`pro` 1、`max` 1 |

> **门槛基于分组，而非模型**：账户的 `free` 分组模型并未被预先消耗，这正是它们在面板自身钱包为空时仍能响应的原因。

> 💡 免费额度由 InfinityRouter 设定，可能变化。请在 [infinityrouter.dev](https://infinityrouter.dev) 查看实时数据 —— 并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 —— 全部 2 个

用一个全新的 `free` 分组密钥调用 `GET /v1/models` 会返回 **2 个模型**（`providers/infinityrouter/out/evidence-20261021.json`，`models_probe` → 200，`count: 2`）：

* `minimax-m3` —— 倍率 0.1，CLI 的默认关卡模型
* `deepseek-v4.1-flash-1017` —— 倍率 0.02，最便宜

密钥的分组决定 `/v1/models` 列出什么；此面板上的 `auto_groups` 为 `basic` / `pro` / `max`，因此付费方案会扩大模型集合，但本仓库中的一切均以新账户天生所属的 `free` 分组实测。

## 🧪 如何使用 API

基础 URL 是 **`https://infinityrouter.dev/v1`** —— 兼容 OpenAI，因此任何支持 OpenAI 的工具都能用（SDK、Cursor、OpenCode、Kilo Code 等）。Anthropic 形态的客户端使用裸主机加 `/v1/messages`。

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* 密钥为 **48 字符的 base62**；控制台显示时带 `sk-` 前缀，**两种形式在 `/v1` 上均被接受**
* 账户的 `access_token` 仅存活 **899 秒（约 15 分钟）**，重新登录又需要 Turnstile —— CLI 在一次运行中完成整条链路，而非稍后恢复
* 无代理池运行 CLI 时直连；有代理列表时，每个账户在同一出口上求解并消费

## 🚀 一条命令

```bash
node src/cli.js --count 10
```

这就是整个工具。一个真实的 Chrome 为你清除 Cloudflare Turnstile —— 该步骤是**自动的**（`--auto`，且默认开启）—— 账户被创建，密钥被铸造，每个密钥在写入 `keys.txt` 之前都通过一次实时的 `chat-200` 验证。仓库旁的 `proxies.txt` 会被自动读取（每个账户一个固定出口）；没有它则直连运行。

`--dry` 打印解析后的计划 —— 数量、代理池大小、求解器可用性、模型 —— 然后退出，不触碰任何文件也不发出任何请求：

```bash
node src/cli.js --dry
```

更喜欢菜单而非命令行参数？`npm start`（或 `node src/launcher.js`）→ **1) Mint keys** → *How many keys? [10]*。

> ⚠️ **条款与账户风险。** 本工具针对第三方面板自动化账户创建和 API 密钥签发。这可能违反面板的服务条款，并可能导致账户、密钥或 IP 被封禁。**自动化由你自己负责**：阅读提供商条款，使用你自己的邮箱和代理，并在运行前确认你所在地区允许这样做。

## 🛠 快速开始

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

`--pool` 文件是可选的：没有它工具直连运行。有它时，每次尝试启动一个 Chrome，固定到该次尝试的出口 —— 同一地址既求解 Turnstile 令牌又消费它，这是面板所强制的。

### 🖱️ 启动器

`npm start`（或 `node src/launcher.js`）是同一 CLI 的菜单形式：**1) Mint keys** → *How many keys? [10]*（回车接受 10）运行 `node src/cli.js --auto --count N`。它从不询问验证码、令牌或代理 —— 存在 `proxies.txt` 时会自动使用。如果缺少 Chrome，菜单会打印一行下载命令（在无头主机上则给出明确错误），并以摘要表（存活/总数、延迟、错误类别）加上 `keys.txt` 路径结束；未通过关卡的密钥落入 `keys-dead.txt`。

## ✅ 已验证可用 —— 每个密钥都经过测试

2026-10-21 实验室运行（账户 id 41 / `ina49d3b`，WARP 出口 `104.28.216.172`），完整链路：页面内生成 Turnstile 令牌 → `GET /api/verification` 200 `success:true` → 从 6 位十六进制邮件中读取验证码 `33b068`（投递 ≤13 秒，有效期 10 分钟）→ `POST /api/user/register` 200 → `POST /api/user/login` 200（JWT，899 秒）→ 创建令牌 → 用 `X-Security-Proof` 完成揭示的逐步验证 → 密钥 `lKT1XLW8n2S1…`（48 字符）。

然后是关卡，重跑两次：`GET /v1/models` → **200，2 个模型**；`minimax-m3` 和 `deepseek-v4.1-flash-1017` 均返回 **HTTP 200 且 `content:"ok"`**，在原始探测和两次重新验证中都是如此。证据：`providers/infinityrouter/out/evidence-20261021.json`（`chat`、`models_probe`、`reverify`），状态 `providers/infinityrouter/out/mint-20261021-state.json`；记录 `proxy-lab/out/infinityrouter-20261021.md`。

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时的 `chat-200`
> （死密钥绝不发布）。路由器组合在模型层面遵循同样的规则：只有当模型能返回 `chat-200` 且能调用工具时，
> 才会添加条目 —— 不支持工具的模型、死密钥或死提供商会被丢弃而非添加。随时重跑验证步骤；
> 失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

注册，每个账户：

1. **页面** —— 一个真实的（带界面）Chrome 从你的代理池中某个出口打开 `/register`。Cloudflare 的过渡页会本地化为浏览器语言，因此 CLI 固定 `--lang=en-US`。
2. **sitekey** —— `GET /api/status → data.turnstile_site_key`（面板自己的密钥；仅当 `/api/status` 不可达时，CLI 才回退到实测常量）。
3. **Turnstile** —— 页面自身的组件生成令牌；它绑定到求解时的 IP（`siteverify` 的 `remoteip`），因此**求解出口 = 消费出口**。CLI 穿过闭合的 shadow root 遍历组件以触及复选框。
4. **邮箱** —— 一个 temp.tf 的 hotmail/outlook **加号别名**，每个账户一个全新地址。
5. **验证码** —— `GET /api/verification?email=&turnstile=` → 面板发送 `Your verification code is: <strong>26995f</strong>`。读取 **6 个十六进制字符**（不是仅数字：CSS 颜色 `404040`/`575757` 就在同一封邮件中）；有效期 10 分钟，投递 ≤13 秒。
6. **注册 + 登录** —— `POST /api/user/register?turnstile=` 然后 `POST /api/user/login?turnstile=` → 控制台 Bearer JWT 加上 `new_api_refresh` cookie（刷新 cookie 在路径 `/api/user/auth` 上是 `HttpOnly`，因此必须在登录时捕获）。
7. **密钥** —— 在 `group=free` 中创建令牌，然后通过逐步验证揭示：`POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → 带 `X-Security-Proof` 的 `POST /api/token/<id>/key`。
8. **关卡** —— 只有当 `/v1/models` 返回 200、**两个不同的提示返回两段不同的非空文本**、且 `get_time` 工具调用返回时，`/v1/chat/completions` 才算通过。只有在此之后密钥才会被追加到 `keys.txt`；失败的记录在 `accounts.json` 中并在下次运行时重试。

> `/api/verify` 是**按用户**限速的（429 且响应体为空，`retry-after` 约 440–464 秒；在四个不同出口上实测相同，而 `/api/user/self` 在每个出口上仍为 200）。它是 `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`。不要猛击揭示接口 —— 铸造一次，然后复用证明。

## ⚙️ CLI 选项

| 参数 | 含义 |
| --- | --- |
| `--count N` | 要铸造的账户数（= 密钥数）（默认 1） |
| `--auto` | 在真实 Chrome 中自动求解 Cloudflare Turnstile（**默认开启**；`--no-auto` 可关闭） |
| `--dry` | 打印解析后的计划并退出（无账户、无文件、无网络） |
| `--pool FILE` | 出口列表，每行一个代理（若存在则默认 `proxies.txt`；`INFINITYROUTER_POOL`） |
| `--proxy URL` | 所有请求使用单一出口 |
| `--exits K` | 每个账户尝试的出口候选数（默认 3） |
| `--model ID` | 用于实时关卡的模型（默认 `minimax-m3`，`INFINITYROUTER_MODEL`） |
| `--group NAME` | 创建密钥所用的令牌分组（默认 `free`） |
| `--port N` | Chrome DevTools 端口（默认：一个空闲端口） |
| `--browser PATH` | Chrome 二进制文件（`CHROME_PATH`） |
| `--headless` | **不推荐** —— Cloudflare 只在可见浏览器中放行 |
| `--keep` | 运行结束时保持 Chrome 打开 |
| `--verify-only` | 重新验证 `keys.txt` 中的每个密钥，不铸造任何东西 |

零依赖；需要 Node.js ≥ 22 以使用全局 `WebSocket` 和 `fetch`。

## 🛰️ 在代理之后

你的代理列表是**可选的** —— 传入 `--pool proxies.txt`，每次尝试都会以 `--proxy-server` 在该次尝试的出口上启动自己的 Chrome，因此该账户发出的每个请求（页面、Turnstile 求解、面板调用、聊天关卡）都从同一地址离开。没有代理池时 CLI 直连，这也是发现 Turnstile 令牌与其消费必须共享同一出口的最快方式。接受 `http`、`socks5` 和 `socks4` 出口；不支持凭据。

## 📄 文件

| 文件 | 内容 |
| --- | --- |
| `keys.txt` | 通过实时关卡的密钥，每行一个 |
| `accounts.json` | 账户 ↔ 出口 ↔ 证明记录（随运行写入） |
| `keys-dead.txt` | 已铸造但从未通过实时关卡的密钥 —— 重试材料 |
| `src/solver.js` | `--auto` 背后的浏览器 + Cloudflare Turnstile 引擎 |
| `repo-spec.json` | 本打包规范 |
| `public-cli.js` | 铸造 / 验证（仅用 node 标准库） |
| `out/evidence-20261021.json` | 实测链路：关卡、链路、聊天、模型、重新验证 |
| `out/mint-20261021-state.json` | 铸造自身的状态 |

## 🔌 连接到 9Router

作为自定义 OpenAI 兼容提供商添加到 9Router：

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

`src/connect-9router.js` 正是注册这些内容，启动器也提供该选项。Anthropic 形态的客户端指向裸主机（`https://infinityrouter.dev`，`/v1/messages`）。

## 🔌 连接到 OmniRoute

作为自定义 OpenAI 兼容提供商添加到 OmniRoute：

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

`src/connect-omniroute.js` 正是注册这些内容，启动器也提供该选项。Anthropic 形态的客户端指向裸主机（`https://infinityrouter.dev`，`/v1/messages`）。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **InfinityRouter** —— [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 提供商提供什么 | 在真实 Chrome 中击败 Cloudflare Turnstile，在密钥揭示时完成安全证明逐步验证 —— 且 `free` 分组在完全没有额度的情况下也能返回 chat-200 |
| 🔑 一个密钥能给你什么 | 一个限定于其自身账户的 API 密钥：下方端点上的 2 个模型 id，受你方案的限制。额度存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 infinityrouter.dev 和你配置的邮箱后端；密钥留在你的机器上 |

## 🐞 问题

* **决定访问权的是分组，而非模型。** 账户的 `free` 分组正是让这两个模型在 `quota` 为 0 且计费为 `subscription_only` 时仍能响应的原因。在其他分组中创建的密钥将看不到相同的集合。
* **`/api/verify` 按用户限速。** 那里的 429 返回**空响应体**和约 440–464 秒的 `retry-after` —— 每个出口的 TTL 相同，因此轮换代理不会重置它。等它过去；揭示本身没问题。
* **仅匹配数字的邮件正则是错的。** 验证码是 6 个十六进制字符，而邮件中带有 CSS 颜色（`404040`、`575757`），`\d{6}` 模式会欣然接受 —— 这个错误在 2026-10-18 耗费了六次尝试。
* **Turnstile 令牌绑定 IP 且一次性使用。** 在一个网络中求解、从另一个网络消费会失败并报 `Turnstile verification failed`；CLI 从不将它们分开。
* **会话很短。** 控制台 `access_token` 持续 899 秒，重新登录需要新的 Turnstile 令牌，因此链路中途闲置的运行必须重新开始。

## 📄 许可证

MIT © 2026 —— 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>