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

**Crea cuentas de InfinityRouter en masa con claves API — un fork de New API cuyo reveal necesita un paso adicional `X-Security-Proof`, más un conector para 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-2-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

InfinityRouter (`infinityrouter.dev`) es un **fork de New API** (`QuantumNous/new-api v1.0.0-rc.34+`) conectado a la facturación `subscription_only`: los únicos planes a la venta son **$39 / $69 / $129 al mes**, una cuenta nueva recibe `quota: 0`, el check-in está desactivado y no hay plan gratuito ni de prueba. Nada de eso impide que los dos modelos del propio **grupo `free`** de la cuenta respondan: medido el 2026-10-21, `minimax-m3` (ratio 0.1) y `deepseek-v4.1-flash-1017` (ratio 0.02) devuelven `chat-200` con uso, repetidamente (`GET /v1/models` → 200, 2 modelos).

Dos barreras se interponen entre tú y una clave, y ambas se resolvieron en lugar de evitarse:

1. **Cloudflare Turnstile** en `GET /api/verification`, `POST /api/user/register` y `POST /api/user/login` (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). El token viaja en la cadena de consulta, es de un solo uso y está vinculado a la IP que lo resuelve (`siteverify` `remoteip`) — así que el navegador que lo genera debe gastarlo desde la misma salida. El panel publica su propia sitekey en `GET /api/status → data.turnstile_site_key` (`0x4AAAAAAFTBBpiFBKxXCi-q` medido); la CLI lanza un Chrome real con interfaz gráfica fijado a tu salida y deja que la página lo genere.
2. **Un paso adicional de "prueba de seguridad" en el reveal de la clave.** `POST /api/token/<id>/key` por sí solo responde **403 `SECURITY_PROOF_REQUIRED`**. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` devuelve `data.proof_token`, y el mismo reveal repetido con `X-Security-Proof: <proof_token>` responde 200 y la clave en texto plano. Scope incorrecto → `SECURITY_PROOF_SCOPE_MISMATCH`, scope correcto sin contexto → 400 `SECURITY_CONTEXT_INVALID`, un JWT en lugar de la prueba → `SECURITY_PROOF_INVALID`.

Otra trampa costó seis intentos el 2026-10-18: el código del correo es de **6 caracteres HEX**, así que una regex solo de dígitos lee alegremente el color CSS `404040` / `575757` del mensaje y el panel responde *"Verification code is incorrect or has expired"*. La CLI usa `[0-9a-f]{6}` e ignora los colores.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Cuota de registro | **0** (`new_user_quota: 0`) — la asignación es el grupo `free`, no un saldo |
| Modo de facturación | `billing_preference: "subscription_only"`; planes **Infinity Basic $39 / Pro $69 / Max $129 al mes**, sin plan gratuito ni de prueba |
| Plan gratuito/de prueba | **ninguno** (`free_plan: null`) |
| Check-in diario | **desactivado** (`checkin_enabled: false`) |
| Grupo de la cuenta | `free` — el grupo del token `auto` no necesita reasignación |
| Modelos con los que se puede hablar | `minimax-m3` (ratio **0.1**), `deepseek-v4.1-flash-1017` (ratio **0.02**) |
| Entrada más barata | `deepseek-v4.1-flash-1017` con ratio 0.02 |
| Ratios de grupo | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> La **barrera se basa en el grupo, no en el modelo**: los modelos del grupo `free` de la cuenta no se consumen por adelantado, y por eso responden aunque la cartera del propio panel esté vacía.

> 💡 El nivel gratuito lo define InfinityRouter y puede cambiar. Consulta los números en vivo en [infinityrouter.dev](https://infinityrouter.dev) — y deja que la propia barrera de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 2 que hay

`GET /v1/models` con una clave nueva del grupo `free` responde **2 modelos** (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — ratio 0.1, el modelo de barrera por defecto de la CLI
* `deepseek-v4.1-flash-1017` — ratio 0.02, el más barato

El grupo de la clave decide lo que lista `/v1/models`; los `auto_groups` de este panel son `basic` / `pro` / `max`, así que un plan de pago ampliaría el conjunto, pero todo en este repositorio está medido con el grupo `free` en el que nace una cuenta nueva.

## 🧪 Cómo usar la API

La URL base es **`https://infinityrouter.dev/v1`** — compatible con OpenAI, así que cualquier cosa que hable OpenAI funciona (SDKs, Cursor, OpenCode, Kilo Code, …). Los clientes con formato Anthropic usan el host sin ruta con `/v1/messages`.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* las claves son **base62 de 48 caracteres**; la consola las muestra con el prefijo `sk-` y **ambas formas se aceptan** en `/v1`
* el `access_token` de la cuenta dura solo **899 s (~15 min)**, y volver a iniciar sesión requiere Turnstile de nuevo — la CLI completa toda la cadena en una sola ejecución en lugar de reanudarla después
* ejecutar la CLI sin pool va directo; una lista de proxies hace que cada cuenta resuelva y gaste en una sola salida

## 🚀 Un solo comando

```bash
node src/cli.js --count 10
```

Esa es toda la herramienta. Un Chrome real supera el Cloudflare Turnstile por ti — ese paso es **automático** (`--auto`, y está activado por defecto) — se crea la cuenta, se genera su clave y cada clave se comprueba con un `chat-200` en vivo antes de llegar a `keys.txt`. Un `proxies.txt` junto al repositorio se detecta automáticamente (una salida fijada por cuenta); sin él, la ejecución va DIRECT.

`--dry` imprime el plan resuelto — recuento, tamaño del pool, disponibilidad del solver, modelo — y sale sin tocar un solo archivo ni hacer una petición:

```bash
node src/cli.js --dry
```

¿Prefieres un menú a las banderas? `npm start` (o `node src/launcher.js`) → **1) Mint keys** → *How many keys? [10]*.

> ⚠️ **Términos y riesgo de cuenta.** Esta herramienta automatiza la creación de cuentas y la emisión de claves API contra un panel de terceros. Eso puede infringir los Términos de Servicio del panel y provocar el baneo de cuentas, claves o IPs. **La automatización es tu propia responsabilidad**: lee los términos del proveedor, usa tu propio buzón y proxies, y asegúrate de que tienes permitido hacer esto donde vives antes de ejecutarlo.

## 🛠 Inicio rápido

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

El archivo `--pool` es opcional: sin él, la herramienta va directo. Con él, se lanza un Chrome por intento, fijado a la salida de ese intento — la misma dirección resuelve el token de Turnstile y lo gasta, algo que el panel exige.

### 🖱️ El lanzador

`npm start` (o `node src/launcher.js`) es la forma de menú de la misma CLI: **1) Mint keys** → *How many keys? [10]* (Enter acepta 10) ejecuta `node src/cli.js --auto --count N`. Nunca pregunta por el captcha, un token ni un proxy — `proxies.txt` se usa automáticamente cuando está presente. Si falta Chrome, el menú imprime el comando de descarga en una línea (o un error claro en un host sin interfaz gráfica), y termina con una tabla resumen (vivas/total, latencia, clases de error) más la ruta de `keys.txt`; las claves que fallaron la barrera acaban en `keys-dead.txt`.

## ✅ Verificado y funcionando — cada clave se prueba

Ejecución de laboratorio 2026-10-21 (id de cuenta 41 / `ina49d3b`, salida WARP `104.28.216.172`), cadena completa: token de Turnstile generado en la página → `GET /api/verification` 200 `success:true` → código `33b068` leído de un correo de 6 HEX (entrega ≤13 s, TTL 10 min) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 s) → token creado → reveal con el paso adicional `X-Security-Proof` → clave `lKT1XLW8n2S1…` (48 caracteres).

Luego la barrera, reejecutada dos veces: `GET /v1/models` → **200, 2 modelos**; `minimax-m3` y `deepseek-v4.1-flash-1017` ambos **HTTP 200 con `content:"ok"`**, en la sonda original y en ambas reverificaciones. Evidencia: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), estado `providers/infinityrouter/out/mint-20261021-state.json`; informe `proxy-lab/out/infinityrouter-20261021.md`.

> **Barreras de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Reejecuta el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

Registro, por cuenta:

1. **página** — un Chrome real (con interfaz) en una salida de tu pool abre `/register`. El interstitial de Cloudflare se localiza según el idioma del navegador, así que la CLI fija `--lang=en-US`.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (la clave propia del panel; la CLI recurre a la constante medida solo si `/api/status` no es accesible).
3. **Turnstile** — el propio widget de la página genera el token; está vinculado a la IP que lo resuelve (`siteverify` `remoteip`), así que **salida de resolución = salida de gasto**. La CLI recorre el widget a través de shadow roots cerrados para llegar a la casilla.
4. **buzón** — un **plus-alias** de hotmail/outlook de temp.tf, una dirección nueva por cuenta.
5. **código** — `GET /api/verification?email=&turnstile=` → el panel envía `Your verification code is: <strong>26995f</strong>`. Lee **6 caracteres HEX** (no solo dígitos: los colores CSS `404040`/`575757` están en el mismo mensaje); válido 10 min, entregado en ≤13 s.
6. **registro + inicio de sesión** — `POST /api/user/register?turnstile=` y luego `POST /api/user/login?turnstile=` → JWT Bearer de consola más la cookie `new_api_refresh` (la cookie de refresco es `HttpOnly` en la ruta `/api/user/auth`, así que hay que capturarla al iniciar sesión).
7. **clave** — token creado en `group=free`, luego revelado mediante el paso adicional: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `POST /api/token/<id>/key` con `X-Security-Proof`.
8. **barrera** — `/v1/chat/completions` solo cuenta si `/v1/models` es 200, **dos prompts distintos devuelven dos textos distintos no vacíos**, y vuelve una llamada a la herramienta `get_time`. Una clave se añade a `keys.txt` solo después de eso; una que falla se registra en `accounts.json` y se reintenta en la siguiente ejecución.

> `/api/verify` tiene límite de tasa **por usuario** (429 con cuerpo vacío y `retry-after` ~440–464 s; medido idéntico en cuatro salidas distintas mientras `/api/user/self` seguía dando 200 en cada una). Es `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`. No machaques el reveal — genera una vez y reutiliza la prueba.

## ⚙️ Opciones de la CLI

| bandera | significado |
| --- | --- |
| `--count N` | cuentas (= claves) a generar (por defecto 1) |
| `--auto` | resuelve el Cloudflare Turnstile en un Chrome real automáticamente (**activado por defecto**; `--no-auto` lo desactiva) |
| `--dry` | imprime el plan resuelto y sale (sin cuentas, sin archivos, sin red) |
| `--pool FILE` | lista de salidas, un proxy por línea (por defecto `proxies.txt` si está presente; `INFINITYROUTER_POOL`) |
| `--proxy URL` | una única salida para todas las peticiones |
| `--exits K` | salidas candidatas probadas por cuenta (por defecto 3) |
| `--model ID` | modelo usado para la barrera en vivo (por defecto `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | grupo del token en el que se crea la clave (por defecto `free`) |
| `--port N` | puerto de Chrome DevTools (por defecto: uno libre) |
| `--browser PATH` | binario de Chrome (`CHROME_PATH`) |
| `--headless` | **no recomendado** — Cloudflare solo se supera en un navegador visible |
| `--keep` | deja Chrome abierto cuando termina la ejecución |
| `--verify-only` | vuelve a comprobar cada clave de `keys.txt`, no genera nada |

Cero dependencias; Node.js ≥ 22 para el `WebSocket` y `fetch` globales.

## 🛰️ Detrás de un proxy

Tu lista de proxies es **opcional** — pasa `--pool proxies.txt` y cada intento recibe su propio Chrome lanzado con `--proxy-server` en la salida de ese intento, así que cada petición que hace esa cuenta (página, resolución de Turnstile, llamadas al panel, la barrera de chat) sale por una sola dirección. Sin pool, la CLI se conecta directamente, que también es la forma más rápida de descubrir que el token de Turnstile y su gasto tienen que compartir una salida. Se aceptan salidas `http`, `socks5` y `socks4`; no se admiten credenciales.

## 📄 Archivos

| archivo | qué |
| --- | --- |
| `keys.txt` | claves que pasaron la barrera en vivo, una por línea |
| `accounts.json` | registro cuenta ↔ salida ↔ prueba (se escribe sobre la marcha) |
| `keys-dead.txt` | claves que se generaron pero nunca pasaron la barrera en vivo — material para reintentar |
| `src/solver.js` | el motor de navegador + Cloudflare Turnstile detrás de `--auto` |
| `repo-spec.json` | esta especificación de empaquetado |
| `public-cli.js` | generar / verificar (solo stdlib de node) |
| `out/evidence-20261021.json` | la cadena medida: barreras, cadena, chat, modelos, reverificaciones |
| `out/mint-20261021-state.json` | el estado propio de la generación |

## 🔌 Conectar con 9Router

Añádelo a 9Router como proveedor personalizado compatible con OpenAI:

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

`src/connect-9router.js` registra exactamente esto, y el lanzador lo ofrece. Los clientes con formato Anthropic apuntan al host sin ruta (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 Conectar con OmniRoute

Añádelo a OmniRoute como proveedor personalizado compatible con OpenAI:

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

`src/connect-omniroute.js` registra exactamente esto, y el lanzador lo ofrece. Los clientes con formato Anthropic apuntan al host sin ruta (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 Qué da el proveedor | Cloudflare Turnstile superado en un Chrome real, un paso adicional de prueba de seguridad gastado en el reveal de la clave — y el grupo `free` responde chat-200 sin cuota alguna |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 2 ids de modelo del endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con infinityrouter.dev y el backend de buzón que configures; las claves se quedan en tu máquina |

## 🐞 Problemas

* **El grupo, no el modelo, decide el acceso.** El grupo `free` de la cuenta es lo que hace que los dos modelos respondan mientras `quota` es 0 y la facturación es `subscription_only`. Una clave creada en otro grupo no verá el mismo conjunto.
* **`/api/verify` tiene límite de tasa por usuario.** Un 429 ahí vuelve con el **cuerpo vacío** y un `retry-after` de alrededor de 440–464 s — el mismo TTL desde cualquier salida, así que rotar proxies no lo reinicia. Espera a que pase; el reveal en sí está bien.
* **La regex de correo solo de dígitos es incorrecta.** El código es de 6 caracteres HEX y el mensaje lleva colores CSS (`404040`, `575757`) que un patrón `\d{6}` aceptará alegremente — ese error quemó seis intentos el 2026-10-18.
* **Los tokens de Turnstile están vinculados a la IP y son de un solo uso.** Resolver en una red y gastar desde otra falla con `Turnstile verification failed`; la CLI nunca los separa.
* **La sesión es corta.** El `access_token` de la consola dura 899 s y volver a iniciar sesión requiere un token de Turnstile nuevo, así que una ejecución que se queda inactiva a mitad de la cadena tiene que empezar de nuevo.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>