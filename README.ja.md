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

**APIキー付きのInfinityRouterアカウントを一括作成 — その公開に `X-Security-Proof` ステップアップを必要とするNew APIフォーク、および9Routerコネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-2-of-them) · [🧪 APIの使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

InfinityRouter (`infinityrouter.dev`) は **New APIフォーク** (`QuantumNous/new-api v1.0.0-rc.34+`) であり、`subscription_only` 課金に接続されています。販売されているプランは **月額$39 / $69 / $129** のみで、新規アカウントの `quota` は `0`、チェックインは無効化されており、無料プランやトライアルプランはありません。しかし、それによってアカウント自身の **`free` グループ**にある2つのモデルが応答しなくなることはありません。2026-10-21の計測では、`minimax-m3` (レシオ 0.1) と `deepseek-v4.1-flash-1017` (レシオ 0.02) が使用量付きで繰り返し `chat-200` を返します (`GET /v1/models` → 200、2モデル)。

キーに到達するまでには2つのゲートがあり、どちらも回避ではなく解決されました:

1. **Cloudflare Turnstile** — `GET /api/verification`、`POST /api/user/register`、`POST /api/user/login` 上に存在します (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`)。トークンはクエリ文字列に乗り、単回使用で、解決したIP (`siteverify` の `remoteip`) に紐付けられます。つまり、それを発行したブラウザが同じ出口から消費しなければなりません。パネルは自身のsitekeyを `GET /api/status → data.turnstile_site_key` で公開しています (計測値 `0x4AAAAAAFTBBpiFBKxXCi-q`)。CLIはあなたの出口に固定された実際のヘッドフルChromeを操作し、ページにそれを発行させます。
2. **キー公開時の「セキュリティプルーフ」ステップアップ。** `POST /api/token/<id>/key` 単体では **403 `SECURITY_PROOF_REQUIRED`** を返します。`POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` は `data.proof_token` を返し、同じ公開を `X-Security-Proof: <proof_token>` 付きで再実行すると200と平文キーを返します。スコープが間違っていると `SECURITY_PROOF_SCOPE_MISMATCH`、スコープは正しいがコンテキストがないと400 `SECURITY_CONTEXT_INVALID`、プルーフの代わりにJWTを渡すと `SECURITY_PROOF_INVALID` になります。

2026-10-18にさらに1つの罠が6回の試行を無駄にしました: メールコードは **6桁の16進文字**であるため、数字のみの正規表現はメッセージからCSSカラー `404040` / `575757` を喜んで読み取ってしまい、パネルは *"Verification code is incorrect or has expired"* と返します。CLIは `[0-9a-f]{6}` を採用し、カラーを無視します。

## 🎁 無料枠 — 得られるもの

| 項目 | 値 |
| --- | --- |
| サインアップ時のクォータ | **0** (`new_user_quota: 0`) — 割り当ては残高ではなく `free` グループです |
| 課金モード | `billing_preference: "subscription_only"`、プランは **Infinity Basic $39 / Pro $69 / Max $129 月額**、無料またはトライアルプランなし |
| 無料/トライアルプラン | **なし** (`free_plan: null`) |
| 毎日のチェックイン | **オフ** (`checkin_enabled: false`) |
| アカウントグループ | `free` — トークングループ `auto` は再バインド不要 |
| 会話可能なモデル | `minimax-m3` (レシオ **0.1**)、`deepseek-v4.1-flash-1017` (レシオ **0.02**) |
| 最安のエントリ | `deepseek-v4.1-flash-1017`、レシオ 0.02 |
| グループレシオ | `free` 1、`basic` 1、`pro` 1、`max` 1 |

> **ゲートはモデルベースではなくグループベースです**: アカウントの `free` グループのモデルは事前消費されておらず、だからこそパネル自身のウォレットが空であっても応答するのです。

> 💡 無料枠はInfinityRouterによって設定され、変更される可能性があります。最新の数値は [infinityrouter.dev](https://infinityrouter.dev) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — その2つすべて

新しい `free` グループのキーで `GET /v1/models` は **2モデル**を返します (`providers/infinityrouter/out/evidence-20261021.json`、`models_probe` → 200、`count: 2`):

* `minimax-m3` — レシオ 0.1、CLIのデフォルトゲートモデル
* `deepseek-v4.1-flash-1017` — レシオ 0.02、最安

キーのグループが `/v1/models` に何をリストするかを決めます。このパネルの `auto_groups` は `basic` / `pro` / `max` であるため、有料プランならセットが広がりますが、このリポジトリのすべては新規アカウントが生まれつき属する `free` グループで計測されています。

## 🧪 APIの使い方

ベースURLは **`https://infinityrouter.dev/v1`** です — OpenAI互換なので、OpenAIを話せるものなら何でも動作します (SDK、Cursor、OpenCode、Kilo Code など)。Anthropic形式のクライアントはベアホストと `/v1/messages` を使用します。

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* キーは **48文字のbase62** です。コンソールは `sk-` プレフィックス付きで表示し、**どちらの形式も** `/v1` で受け入れられます
* アカウントの `access_token` は **899秒 (約15分)** しか有効でなく、再ログインには再びTurnstileが必要です — CLIは後で再開するのではなく、1回の実行でチェーン全体を完了します
* CLIをプールなしで実行すると直接接続します。プロキシリストを使うと、各アカウントが1つの出口で解決して消費します

## 🛠 クイックスタート

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

`--pool` ファイルはオプションです: なければツールは直接実行します。あれば、Chromeは試行ごとに1ブラウザ起動され、その試行の出口に固定されます — 同じアドレスがTurnstileトークンを解決して消費し、パネルはそれを強制します。

### 🖱️ ランチャー

`src/launcher.js` (このREADMEと同じバナー) は、ミントに必要な少数の回答 — アカウント数、出口リスト、ゲートモデル — を尋ね、それらを `launcher.config.json` に記憶し、その後 `src/cli.js` を実行します。同じCLIですが、フラグを覚える必要がありません。

## ✅ 検証済みで動作 — すべてのキーがテストされます

2026-10-21のラボ実行 (アカウントID 41 / `ina49d3b`、WARP出口 `104.28.216.172`)、チェーン全体: Turnstileトークンをページ内で発行 → `GET /api/verification` 200 `success:true` → 6桁16進メールからコード `33b068` を読み取り (配信 ≤13秒、TTL 10分) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT、899秒) → トークン作成 → `X-Security-Proof` で公開をステップアップ → キー `lKT1XLW8n2S1…` (48文字)。

その後ゲートを2回再実行: `GET /v1/models` → **200、2モデル**、`minimax-m3` と `deepseek-v4.1-flash-1017` はどちらも **HTTP 200 で `content:"ok"`**、最初のプローブと両方の再検証で。証拠: `providers/infinityrouter/out/evidence-20261021.json` (`chat`、`models_probe`、`reverify`)、状態 `providers/infinityrouter/out/mint-20261021-state.json`、記録 `proxy-lab/out/infinityrouter-20261021.md`。

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> (死んだキーは決して出荷されません)。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダは追加されずに削除されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

サインアップ、アカウントごと:

1. **ページ** — プールからの1つの出口上の実際の (ヘッドフル) Chromeが `/register` を開きます。Cloudflareのインタースティシャルはブラウザ言語にローカライズされるため、CLIは `--lang=en-US` を固定します。
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (パネル自身のキー。CLIは `/api/status` に到達できない場合にのみ、計測済み定数にフォールバックします)。
3. **Turnstile** — ページ自身のウィジェットがトークンを発行します。それは解決したIP (`siteverify` の `remoteip`) に紐付けられるため、**解決出口 = 消費出口**です。CLIは閉じたシャドウルートを通ってウィジェットを操作し、チェックボックスに到達します。
4. **メールボックス** — temp.tfのhotmail/outlook **プラスエイリアス**、アカウントごとに1つの新しいアドレス。
5. **コード** — `GET /api/verification?email=&turnstile=` → パネルは `Your verification code is: <strong>26995f</strong>` を送信します。**6桁の16進文字**を読み取ります (数字のみではありません: CSSカラー `404040`/`575757` が同じメッセージにあります)。有効期間10分、配信 ≤13秒。
6. **登録 + ログイン** — `POST /api/user/register?turnstile=` の後に `POST /api/user/login?turnstile=` → コンソールのBearer JWTと `new_api_refresh` Cookie (リフレッシュCookieはパス `/api/user/auth` 上の `HttpOnly` であるため、ログイン時にキャプチャする必要があります)。
7. **キー** — トークンを `group=free` で作成し、ステップアップを通して公開します: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `X-Security-Proof` 付きの `POST /api/token/<id>/key`。
8. **ゲート** — `/v1/chat/completions` は、`/v1/models` が200であり、**2つの異なるプロンプトが2つの異なる非空テキストを返し**、`get_time` ツール呼び出しが返ってきた場合にのみカウントされます。キーはその後でのみ `keys.txt` に追加されます。失敗したものは `accounts.json` に記録され、次回の実行で再試行されます。

> `/api/verify` は **ユーザーごとに**レート制限されています (空のボディと `retry-after` 約440〜464秒で429。4つの異なる出口で同一に計測され、その間 `/api/user/self` はそれぞれで200のままでした)。これは `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")` です。公開を連打しないでください — 一度ミントし、その後プルーフを再利用してください。

## ⚙️ CLIオプション

| フラグ | 意味 |
| --- | --- |
| `--count N` | ミントするアカウント数 (= キー数) (デフォルト 1) |
| `--pool FILE` | 出口リスト、1行に1プロキシ (存在すればデフォルト `proxies.txt`、`INFINITYROUTER_POOL`) |
| `--proxy URL` | すべてのリクエストに単一の出口 |
| `--exits K` | アカウントごとに試行する出口候補 (デフォルト 3) |
| `--model ID` | ライブゲートに使用するモデル (デフォルト `minimax-m3`、`INFINITYROUTER_MODEL`) |
| `--group NAME` | キーを作成するトークングループ (デフォルト `free`) |
| `--port N` | Chrome DevToolsポート (デフォルト: 空いているもの) |
| `--browser PATH` | Chromeバイナリ (`CHROME_PATH`) |
| `--headless` | **推奨されません** — Cloudflareは可視ブラウザでのみクリアされます |
| `--keep` | 実行終了時にChromeを開いたままにする |
| `--verify-only` | `keys.txt` のすべてのキーを再検証し、何もミントしない |

依存関係ゼロ。グローバルの `WebSocket` と `fetch` のためにNode.js ≥ 22が必要です。

## 🛰️ プロキシの背後で

プロキシリストは**オプション**です — `--pool proxies.txt` を渡すと、各試行がその試行の出口で `--proxy-server` 付きで起動された独自のChromeを取得するため、そのアカウントが行うすべてのリクエスト (ページ、Turnstile解決、パネル呼び出し、チャットゲート) が1つのアドレスから出ていきます。プールなしではCLIは直接接続します。これはTurnstileトークンとその消費が出口を共有しなければならないことを知る最速の方法でもあります。`http`、`socks5`、`socks4` の出口が受け入れられます。認証情報はサポートされていません。

## 📄 ファイル

| ファイル | 内容 |
| --- | --- |
| `keys.txt` | ライブゲートを通過したキー、1行に1つ |
| `accounts.json` | アカウント ↔ 出口 ↔ プルーフの記録 (進行に応じて書き込み) |
| `repo-spec.json` | このパッケージング仕様 |
| `public-cli.js` | ミント / 検証 (node標準ライブラリのみ) |
| `out/evidence-20261021.json` | 計測されたチェーン: ゲート、チェーン、チャット、モデル、再検証 |
| `out/mint-20261021-state.json` | ミント自身の状態 |

## 🔌 9Routerへの接続

カスタムのOpenAI互換プロバイダとして9Routerに追加します:

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

`src/connect-9router.js` はまさにこれを登録し、ランチャーがそれを提供します。Anthropic形式のクライアントはベアホスト (`https://infinityrouter.dev`、`/v1/messages`) を指定します。

## 🔌 OmniRouteへの接続

カスタムのOpenAI互換プロバイダとしてOmniRouteに追加します:

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

`src/connect-omniroute.js` はまさにこれを登録し、ランチャーがそれを提供します。Anthropic形式のクライアントはベアホスト (`https://infinityrouter.dev`、`/v1/messages`) を指定します。

## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダ | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 プロバイダが提供するもの | 実際のChromeで打ち負かされたCloudflare Turnstile、キー公開時に消費されるセキュリティプルーフのステップアップ — そして `free` グループはクォータなしでchat-200を返します |
| 🔑 1つのキーで得られるもの | 自身のアカウントにスコープされた1つのAPIキー: 下のエンドポイントにある2つのモデルIDを、あなたのプランの制限で。クォータは**アカウント**に存在し、だからこそこのツールはキーごとに1つのアカウントを作成します |
| 🌐 API形状 | OpenAI互換: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 あなたのデータ | infinityrouter.devと、あなたが設定した受信トレイバックエンドのみが接触されます。キーはあなたのマシンに留まります |

## 🐞 問題

* **アクセスを決めるのはモデルではなくグループです。** アカウントの `free` グループが、`quota` が0で課金が `subscription_only` であっても2つのモデルを応答させる理由です。別のグループで作成されたキーは同じセットを見ることができません。
* **`/api/verify` はユーザーごとにレート制限されています。** そこでの429は**空のボディ**と約440〜464秒の `retry-after` で返ってきます — すべての出口で同じTTLなので、プロキシをローテートしてもリセットされません。待ちましょう。公開自体は問題ありません。
* **数字のみのメール正規表現は間違っています。** コードは6桁の16進文字で、メッセージには `\d{6}` パターンが喜んで受け入れるCSSカラー (`404040`、`575757`) が含まれています — その間違いは2026-10-18に6回の試行を焼き尽くしました。
* **TurnstileトークンはIPに紐付けられ、単回使用です。** あるネットワークで解決し別のネットワークから消費すると `Turnstile verification failed` で失敗します。CLIは決してそれらを分離しません。
* **セッションは短命です。** コンソールの `access_token` は899秒持続し、再ログインには新しいTurnstileトークンが必要なので、チェーンの途中でアイドル状態になった実行は最初からやり直さなければなりません。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>