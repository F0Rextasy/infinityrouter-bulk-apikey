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

**Crie contas InfinityRouter em massa com chaves de API — um fork do New API cuja revelação exige um step-up com `X-Security-Proof`, além de um conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-2-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

O InfinityRouter (`infinityrouter.dev`) é um **fork do New API** (`QuantumNous/new-api v1.0.0-rc.34+`) ligado à cobrança `subscription_only`: os únicos planos à venda são **$39 / $69 / $129 por mês**, uma conta nova recebe `quota: 0`, o check-in está desativado e não há plano gratuito ou de teste. Nada disso impede os dois modelos do próprio **grupo `free`** da conta de responderem: medido em 2026-10-21, `minimax-m3` (ratio 0.1) e `deepseek-v4.1-flash-1017` (ratio 0.02) retornam `chat-200` com usage, repetidamente (`GET /v1/models` → 200, 2 modelos).

Dois portões ficam entre você e uma chave, e ambos foram resolvidos em vez de contornados:

1. **Cloudflare Turnstile** em `GET /api/verification`, `POST /api/user/register` e `POST /api/user/login` (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). O token viaja na query string, é de uso único e está vinculado ao IP que o resolveu (`siteverify` `remoteip`) — então o navegador que o gera deve gastá-lo pela mesma saída. O painel publica sua própria sitekey em `GET /api/status → data.turnstile_site_key` (`0x4AAAAAAFTBBpiFBKxXCi-q` medido); a CLI conduz um Chrome real com interface fixado na sua saída e deixa a página gerá-lo.
2. **Um step-up de "security proof" na revelação da chave.** `POST /api/token/<id>/key` sozinho responde **403 `SECURITY_PROOF_REQUIRED`**. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` retorna `data.proof_token`, e a mesma revelação repetida com `X-Security-Proof: <proof_token>` responde 200 e a chave em texto claro. Scope errado → `SECURITY_PROOF_SCOPE_MISMATCH`, scope certo sem context → 400 `SECURITY_CONTEXT_INVALID`, um JWT no lugar do proof → `SECURITY_PROOF_INVALID`.

Mais uma armadilha custou seis tentativas em 2026-10-18: o código do e-mail tem **6 caracteres HEX**, então uma regex só de dígitos lê alegremente a cor CSS `404040` / `575757` da mensagem e o painel responde *"Verification code is incorrect or has expired"*. A CLI usa `[0-9a-f]{6}` e ignora as cores.

## 🎁 Nível gratuito — quanto você recebe

| O quê | Valor |
| --- | --- |
| Quota de cadastro | **0** (`new_user_quota: 0`) — a cota é o grupo `free`, não um saldo |
| Modo de cobrança | `billing_preference: "subscription_only"`; planos **Infinity Basic $39 / Pro $69 / Max $129 por mês**, sem plano gratuito ou de teste |
| Plano gratuito/teste | **nenhum** (`free_plan: null`) |
| Check-in diário | **desativado** (`checkin_enabled: false`) |
| Grupo da conta | `free` — o grupo do token `auto` não precisa de reatribuição |
| Modelos conversáveis | `minimax-m3` (ratio **0.1**), `deepseek-v4.1-flash-1017` (ratio **0.02**) |
| Entrada mais barata | `deepseek-v4.1-flash-1017` com ratio 0.02 |
| Ratios de grupo | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> O **portão é baseado em grupo, não em modelo**: os modelos do grupo `free` da conta não são pré-consumidos, e é por isso que eles respondem mesmo com a carteira do próprio painel vazia.

> 💡 O nível gratuito é definido pelo InfinityRouter e pode mudar. Confira os números ao vivo em [infinityrouter.dev](https://infinityrouter.dev) — e deixe o próprio portão da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 2

`GET /v1/models` com uma chave nova do grupo `free` responde **2 modelos** (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — ratio 0.1, o modelo de portão padrão da CLI
* `deepseek-v4.1-flash-1017` — ratio 0.02, o mais barato

O grupo da chave decide o que `/v1/models` lista; os `auto_groups` neste painel são `basic` / `pro` / `max`, então um plano pago ampliaria o conjunto, mas tudo neste repositório é medido com o grupo `free` no qual uma conta nova nasce.

## 🧪 Como usar a API

A URL base é **`https://infinityrouter.dev/v1`** — compatível com OpenAI, então qualquer coisa que fale OpenAI funciona (SDKs, Cursor, OpenCode, Kilo Code, …). Clientes no formato Anthropic usam o host puro com `/v1/messages`.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* as chaves têm **48 caracteres base62**; o console as exibe com um prefixo `sk-` e **ambas as formas são aceitas** em `/v1`
* o `access_token` da conta dura apenas **899 s (~15 min)**, e um novo login exige Turnstile novamente — a CLI conclui toda a cadeia em uma única execução em vez de retomá-la depois
* executar a CLI sem pool vai direto; uma lista de proxies faz cada conta resolver e gastar em uma única saída

## 🚀 Um comando

```bash
node src/cli.js --count 10
```

Essa é a ferramenta inteira. Um Chrome real resolve o Cloudflare Turnstile para você — essa etapa é **automática** (`--auto`, e está ativada por padrão) —, a conta é criada, sua chave é gerada e cada chave é comprovada por um `chat-200` ao vivo antes de chegar a `keys.txt`. Um `proxies.txt` ao lado do repositório é detectado automaticamente (uma saída fixada por conta); sem ele, a execução vai DIRETO.

`--dry` imprime o plano resolvido — contagem, tamanho do pool, disponibilidade do solver, modelo — e sai sem tocar em um único arquivo ou fazer uma requisição:

```bash
node src/cli.js --dry
```

Prefere um menu a flags? `npm start` (ou `node src/launcher.js`) → **1) Mint keys** → *How many keys? [10]*.

> ⚠️ **Termos e risco de conta.** Esta ferramenta automatiza a criação de contas e a emissão de chaves de API contra um painel de terceiros. Isso pode violar os Termos de Serviço do painel e pode levar ao banimento de contas, chaves ou IPs. **A automação é de sua própria responsabilidade**: leia os termos do provedor, use sua própria caixa de entrada e proxies, e certifique-se de que você tem permissão para fazer isso onde vive antes de executar.

## 🛠 Início rápido

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

O arquivo `--pool` é opcional: sem ele, a ferramenta roda direto. Com ele, o Chrome é iniciado um navegador por tentativa, fixado na saída daquela tentativa — o mesmo endereço resolve o token do Turnstile e o gasta, o que o painel exige.

### 🖱️ O launcher

`npm start` (ou `node src/launcher.js`) é a forma em menu da mesma CLI: **1) Mint keys** → *How many keys? [10]* (Enter aceita 10) executa `node src/cli.js --auto --count N`. Ele nunca pergunta sobre o captcha, um token ou um proxy — `proxies.txt` é usado automaticamente quando presente. Se o Chrome estiver faltando, o menu imprime o comando de download em uma linha (ou um erro claro em um host headless), e termina com uma tabela de resumo (ativas/total, latência, classes de erro) mais o caminho de `keys.txt`; chaves que falharam no portão vão para `keys-dead.txt`.

## ✅ Verificado e funcionando — toda chave é testada

Execução de laboratório em 2026-10-21 (id da conta 41 / `ina49d3b`, saída WARP `104.28.216.172`), cadeia completa: token do Turnstile gerado na página → `GET /api/verification` 200 `success:true` → código `33b068` lido de um e-mail de 6 HEX (entrega ≤13 s, TTL 10 min) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 s) → token criado → revelação com step-up via `X-Security-Proof` → chave `lKT1XLW8n2S1…` (48 caracteres).

Depois o portão, executado mais duas vezes: `GET /v1/models` → **200, 2 modelos**; `minimax-m3` e `deepseek-v4.1-flash-1017` ambos **HTTP 200 com `content:"ok"`**, na sondagem original e nas duas reverificações. Evidências: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), estado `providers/infinityrouter/out/mint-20261021-state.json`; relatório `proxy-lab/out/infinityrouter-20261021.md`.

> **Portões de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser escrita em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e conseguir chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são relatadas, nunca escondidas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

Cadastro, por conta:

1. **página** — um Chrome real (com interface) em uma saída do seu pool abre `/register`. O interstitial da Cloudflare é localizado pelo idioma do navegador, então a CLI fixa `--lang=en-US`.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (a chave do próprio painel; a CLI recorre à constante medida apenas se `/api/status` estiver inacessível).
3. **Turnstile** — o próprio widget da página gera o token; ele está vinculado ao IP que o resolveu (`siteverify` `remoteip`), então **saída de resolução = saída de gasto**. A CLI percorre o widget por shadow roots fechados para alcançar a caixa de seleção.
4. **caixa de correio** — um **plus-alias** hotmail/outlook do temp.tf, um endereço novo por conta.
5. **código** — `GET /api/verification?email=&turnstile=` → o painel envia `Your verification code is: <strong>26995f</strong>`. Leia **6 caracteres HEX** (não só dígitos: as cores CSS `404040`/`575757` estão na mesma mensagem); válido por 10 min, entregue em ≤13 s.
6. **register + login** — `POST /api/user/register?turnstile=` depois `POST /api/user/login?turnstile=` → JWT Bearer do console mais o cookie `new_api_refresh` (o cookie de refresh é `HttpOnly` no caminho `/api/user/auth`, então precisa ser capturado no login).
7. **chave** — token criado em `group=free`, depois revelado através do step-up: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `POST /api/token/<id>/key` com `X-Security-Proof`.
8. **portão** — `/v1/chat/completions` só conta se `/v1/models` for 200, **dois prompts diferentes retornarem dois textos não vazios diferentes**, e uma chamada de ferramenta `get_time` voltar. Uma chave só é anexada a `keys.txt` depois disso; uma que falha é registrada em `accounts.json` e tentada novamente na próxima execução.

> `/api/verify` tem rate limit **por usuário** (429 com corpo vazio e `retry-after` ~440–464 s; medido idêntico em quatro saídas diferentes enquanto `/api/user/self` permanecia 200 em cada uma). É `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`. Não martele a revelação — gere uma vez, depois reutilize o proof.

## ⚙️ Opções da CLI

| flag | significado |
| --- | --- |
| `--count N` | contas (= chaves) a gerar (padrão 1) |
| `--auto` | resolve o Cloudflare Turnstile em um Chrome real automaticamente (**ativado por padrão**; `--no-auto` desativa) |
| `--dry` | imprime o plano resolvido e sai (sem contas, sem arquivos, sem rede) |
| `--pool FILE` | lista de saídas, um proxy por linha (padrão `proxies.txt` se presente; `INFINITYROUTER_POOL`) |
| `--proxy URL` | uma única saída para todas as requisições |
| `--exits K` | saídas candidatas tentadas por conta (padrão 3) |
| `--model ID` | modelo usado para o portão ao vivo (padrão `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | grupo do token no qual a chave é criada (padrão `free`) |
| `--port N` | porta do Chrome DevTools (padrão: uma livre) |
| `--browser PATH` | binário do Chrome (`CHROME_PATH`) |
| `--headless` | **não recomendado** — a Cloudflare só libera em um navegador visível |
| `--keep` | deixa o Chrome aberto quando a execução termina |
| `--verify-only` | reverifica toda chave em `keys.txt`, não gera nada |

Zero dependências; Node.js ≥ 22 para o `WebSocket` e o `fetch` globais.

## 🛰️ Atrás de um proxy

Sua lista de proxies é **opcional** — passe `--pool proxies.txt` e cada tentativa recebe seu próprio Chrome iniciado com `--proxy-server` na saída daquela tentativa, então toda requisição que aquela conta faz (página, resolução do Turnstile, chamadas ao painel, o portão de chat) sai por um único endereço. Sem um pool, a CLI se conecta diretamente, o que também é a maneira mais rápida de descobrir que o token do Turnstile e seu gasto precisam compartilhar uma saída. Saídas `http`, `socks5` e `socks4` são aceitas; credenciais não são suportadas.

## 📄 Arquivos

| arquivo | o quê |
| --- | --- |
| `keys.txt` | chaves que passaram no portão ao vivo, uma por linha |
| `accounts.json` | registro conta ↔ saída ↔ proof (escrito conforme avança) |
| `keys-dead.txt` | chaves que foram geradas mas nunca passaram no portão ao vivo — material para nova tentativa |
| `src/solver.js` | o motor de navegador + Cloudflare Turnstile por trás de `--auto` |
| `repo-spec.json` | esta especificação de empacotamento |
| `public-cli.js` | mint / verify (apenas stdlib do node) |
| `out/evidence-20261021.json` | a cadeia medida: portões, cadeia, chat, modelos, reverificações |
| `out/mint-20261021-state.json` | o estado da própria geração |

## 🔌 Conectar ao 9Router

Adicione ao 9Router como um provedor personalizado compatível com OpenAI:

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

`src/connect-9router.js` registra exatamente isso, e o launcher o oferece. Clientes no formato Anthropic apontam para o host puro (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 Conectar ao OmniRoute

Adicione ao OmniRoute como um provedor personalizado compatível com OpenAI:

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

`src/connect-omniroute.js` registra exatamente isso, e o launcher o oferece. Clientes no formato Anthropic apontam para o host puro (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 O que uma chave lhe dá

| | |
| --- | --- |
| 🏢 Provedor | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 O que o provedor dá | Cloudflare Turnstile vencido em um Chrome real, um step-up de security proof gasto na revelação da chave — e o grupo `free` responde chat-200 sem quota alguma |
| 🔑 O que uma chave lhe dá | uma chave de API limitada à sua própria conta: os 2 ids de modelo no endpoint abaixo, nos limites do seu plano. A quota fica na **conta**, e é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Seus dados | apenas infinityrouter.dev e o backend de caixa de entrada que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

* **O grupo, não o modelo, decide o acesso.** O grupo `free` da conta é o que faz os dois modelos responderem enquanto `quota` é 0 e a cobrança é `subscription_only`. Uma chave criada em outro grupo não verá o mesmo conjunto.
* **`/api/verify` tem rate limit por usuário.** Um 429 ali volta com **corpo vazio** e um `retry-after` em torno de 440–464 s — o mesmo TTL de todas as saídas, então rotacionar proxies não o reinicia. Espere passar; a revelação em si está bem.
* **Regex de e-mail só de dígitos está errada.** O código tem 6 caracteres HEX e a mensagem carrega cores CSS (`404040`, `575757`) que um padrão `\d{6}` aceitará alegremente — esse erro queimou seis tentativas em 2026-10-18.
* **Tokens do Turnstile são vinculados ao IP e de uso único.** Resolver em uma rede e gastar de outra falha com `Turnstile verification failed`; a CLI nunca os separa.
* **A sessão é curta.** O `access_token` do console dura 899 s e um novo login exige um token do Turnstile novo, então uma execução que fica ociosa no meio da cadeia tem que começar de novo.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>