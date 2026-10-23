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

**Créez en masse des comptes InfinityRouter avec des clés API — un fork de New API dont la révélation nécessite une étape de renforcement `X-Security-Proof`, plus un connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-2-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cela existe

InfinityRouter (`infinityrouter.dev`) est un **fork de New API** (`QuantumNous/new-api v1.0.0-rc.34+`) câblé sur une facturation `subscription_only` : les seules offres en vente sont **39 $ / 69 $ / 129 $ par mois**, un nouveau compte reçoit `quota: 0`, le check-in est désactivé et il n'existe ni offre gratuite ni essai. Rien de tout cela n'empêche les deux modèles du **groupe `free`** propre au compte de répondre : mesuré le 2026-10-21, `minimax-m3` (ratio 0.1) et `deepseek-v4.1-flash-1017` (ratio 0.02) renvoient `chat-200` avec usage, de façon répétée (`GET /v1/models` → 200, 2 modèles).

Deux verrous se dressent entre vous et une clé, et tous deux ont été résolus plutôt que contournés :

1. **Cloudflare Turnstile** sur `GET /api/verification`, `POST /api/user/register` et `POST /api/user/login` (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). Le token voyage dans la chaîne de requête, est à usage unique et est lié à l'IP de résolution (`siteverify` `remoteip`) — donc le navigateur qui le génère doit le dépenser depuis la même sortie. Le panneau publie sa propre sitekey sur `GET /api/status → data.turnstile_site_key` (`0x4AAAAAAFTBBpiFBKxXCi-q` mesuré) ; le CLI pilote un vrai Chrome avec interface graphique épinglé à votre sortie et laisse la page le générer.
2. **Une étape de renforcement « security proof » sur la révélation de la clé.** `POST /api/token/<id>/key` seul répond **403 `SECURITY_PROOF_REQUIRED`**. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` renvoie `data.proof_token`, et la même révélation rejouée avec `X-Security-Proof: <proof_token>` répond 200 et la clé en clair. Mauvais scope → `SECURITY_PROOF_SCOPE_MISMATCH`, bon scope sans contexte → 400 `SECURITY_CONTEXT_INVALID`, un JWT à la place du proof → `SECURITY_PROOF_INVALID`.

Un piège supplémentaire a coûté six tentatives le 2026-10-18 : le code du mail fait **6 caractères HEX**, donc une regex limitée aux chiffres lit allègrement la couleur CSS `404040` / `575757` dans le message et le panneau répond *« Verification code is incorrect or has expired »*. Le CLI prend `[0-9a-f]{6}` et ignore les couleurs.

## 🎁 Offre gratuite — ce que vous obtenez

| Quoi | Valeur |
| --- | --- |
| Quota d'inscription | **0** (`new_user_quota: 0`) — l'allocation est le groupe `free`, pas un solde |
| Mode de facturation | `billing_preference: "subscription_only"` ; offres **Infinity Basic 39 $ / Pro 69 $ / Max 129 $ par mois**, ni offre gratuite ni essai |
| Offre gratuite/essai | **aucune** (`free_plan: null`) |
| Check-in quotidien | **désactivé** (`checkin_enabled: false`) |
| Groupe du compte | `free` — le groupe de token `auto` ne nécessite aucun rattachement |
| Modèles utilisables | `minimax-m3` (ratio **0.1**), `deepseek-v4.1-flash-1017` (ratio **0.02**) |
| Entrée la moins chère | `deepseek-v4.1-flash-1017` à ratio 0.02 |
| Ratios de groupe | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> Le **verrou est basé sur le groupe, pas sur le modèle** : les modèles du groupe `free` du compte ne sont pas pré-consommés, ce qui explique qu'ils répondent alors même que le portefeuille du panneau est vide.

> 💡 L'offre gratuite est définie par InfinityRouter et peut changer. Consultez les chiffres en direct sur [infinityrouter.dev](https://infinityrouter.dev) — et laissez le verrou de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 2 au complet

`GET /v1/models` avec une clé fraîche du groupe `free` répond **2 modèles** (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`) :

* `minimax-m3` — ratio 0.1, modèle de verrou par défaut du CLI
* `deepseek-v4.1-flash-1017` — ratio 0.02, le moins cher

Le groupe de la clé décide de ce que `/v1/models` liste ; les `auto_groups` de ce panneau sont `basic` / `pro` / `max`, donc une offre payante élargirait l'ensemble, mais tout dans ce dépôt est mesuré avec le groupe `free` dans lequel naît un nouveau compte.

## 🧪 Comment utiliser l'API

L'URL de base est **`https://infinityrouter.dev/v1`** — compatible OpenAI, donc tout ce qui parle OpenAI fonctionne (SDK, Cursor, OpenCode, Kilo Code, …). Les clients au format Anthropic utilisent l'hôte nu avec `/v1/messages`.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* les clés font **48 caractères base62** ; la console les affiche avec un préfixe `sk-` et **les deux formes sont acceptées** sur `/v1`
* l'`access_token` du compte ne vit que **899 s (~15 min)**, et une reconnexion nécessite à nouveau Turnstile — le CLI termine toute la chaîne en une seule exécution plutôt que de la reprendre plus tard
* lancer le CLI sans pool passe en direct ; une liste de proxys fait que chaque compte résout et dépense sur une seule sortie

## 🚀 Une seule commande

```bash
node src/cli.js --count 10
```

C'est tout l'outil. Un vrai Chrome franchit le Cloudflare Turnstile pour vous — cette étape est **automatique** (`--auto`, et elle est activée par défaut) — le compte est créé, sa clé est générée et chaque clé est prouvée par un `chat-200` en direct avant d'atteindre `keys.txt`. Un `proxies.txt` à côté du dépôt est récupéré automatiquement (une sortie épinglée par compte) ; sans lui, l'exécution passe en DIRECT.

`--dry` affiche le plan résolu — nombre, taille du pool, disponibilité du solveur, modèle — et se termine sans toucher à un seul fichier ni faire de requête :

```bash
node src/cli.js --dry
```

Vous préférez un menu aux options ? `npm start` (ou `node src/launcher.js`) → **1) Mint keys** → *How many keys? [10]*.

> ⚠️ **Conditions et risque de compte.** Cet outil automatise la création de comptes et l'émission de clés API contre un panneau tiers. Cela peut enfreindre les conditions d'utilisation du panneau et entraîner le bannissement de comptes, de clés ou d'IP. **L'automatisation est votre propre responsabilité** : lisez les conditions du fournisseur, utilisez votre propre boîte mail et vos propres proxys, et assurez-vous d'être autorisé à le faire là où vous vivez avant de l'exécuter.

## 🛠 Démarrage rapide

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

Le fichier `--pool` est facultatif : sans lui, l'outil fonctionne en direct. Avec lui, Chrome est lancé un navigateur par tentative, épinglé à la sortie de cette tentative — la même adresse résout le token Turnstile et le dépense, ce que le panneau impose.

### 🖱️ Le lanceur

`npm start` (ou `node src/launcher.js`) est la forme en menu du même CLI : **1) Mint keys** → *How many keys? [10]* (Entrée accepte 10) exécute `node src/cli.js --auto --count N`. Il ne demande jamais de captcha, de token ou de proxy — `proxies.txt` est utilisé automatiquement lorsqu'il est présent. Si Chrome est absent, le menu affiche la commande de téléchargement en une ligne (ou une erreur claire sur un hôte sans interface graphique), et il se termine par un tableau récapitulatif (live/total, latence, classes d'erreur) ainsi que le chemin de `keys.txt` ; les clés ayant échoué au verrou atterrissent dans `keys-dead.txt`.

## ✅ Vérifié fonctionnel — chaque clé est testée

Exécution en laboratoire le 2026-10-21 (id de compte 41 / `ina49d3b`, sortie WARP `104.28.216.172`), chaîne complète : token Turnstile généré dans la page → `GET /api/verification` 200 `success:true` → code `33b068` lu dans un mail à 6 HEX (livraison ≤13 s, TTL 10 min) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 s) → token créé → révélation renforcée avec `X-Security-Proof` → clé `lKT1XLW8n2S1…` (48 caractères).

Puis le verrou, réexécuté deux fois : `GET /v1/models` → **200, 2 modèles** ; `minimax-m3` et `deepseek-v4.1-flash-1017` tous deux **HTTP 200 avec `content:"ok"`**, dans la sonde d'origine et dans les deux revérifications. Preuves : `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), état `providers/infinityrouter/out/mint-20261021-state.json` ; compte rendu `proxy-lab/out/infinityrouter-20261021.md`.

> **Contrôles qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combinaisons de routeur suivent la même règle au niveau du modèle : une entrée est
> ajoutée **uniquement si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais cachés.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: InfinityRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://infinityrouter.dev/v1/chat/completions → real content = the key is live
```

Inscription, par compte :

1. **page** — un vrai Chrome (avec interface graphique) sur une sortie de votre pool ouvre `/register`. L'interstitiel Cloudflare est localisé selon la langue du navigateur, donc le CLI force `--lang=en-US`.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (la clé propre au panneau ; le CLI ne retombe sur la constante mesurée que si `/api/status` est injoignable).
3. **Turnstile** — le widget de la page génère lui-même le token ; il est lié à l'IP de résolution (`siteverify` `remoteip`), donc **sortie de résolution = sortie de dépense**. Le CLI parcourt le widget à travers des shadow roots fermés pour atteindre la case à cocher.
4. **boîte mail** — un **plus-alias** hotmail/outlook temp.tf, une adresse fraîche par compte.
5. **code** — `GET /api/verification?email=&turnstile=` → le panneau envoie `Your verification code is: <strong>26995f</strong>`. Lire **6 caractères HEX** (pas uniquement des chiffres : les couleurs CSS `404040`/`575757` sont dans le même message) ; valide 10 min, livré en ≤13 s.
6. **register + login** — `POST /api/user/register?turnstile=` puis `POST /api/user/login?turnstile=` → JWT Bearer de la console plus le cookie `new_api_refresh` (le cookie de rafraîchissement est `HttpOnly` sur le chemin `/api/user/auth`, il doit donc être capturé à la connexion).
7. **clé** — token créé dans `group=free`, puis révélé via le renforcement : `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `POST /api/token/<id>/key` avec `X-Security-Proof`.
8. **verrou** — `/v1/chat/completions` ne compte que si `/v1/models` est 200, que **deux invites différentes renvoient deux textes non vides différents**, et qu'un appel d'outil `get_time` revient. Une clé n'est ajoutée à `keys.txt` qu'après cela ; une clé défaillante est enregistrée dans `accounts.json` et réessayée à l'exécution suivante.

> `/api/verify` est limité en débit **par utilisateur** (429 avec un corps vide et `retry-after` ~440–464 s ; mesuré identique sur quatre sorties différentes tandis que `/api/user/self` restait 200 sur chacune). C'est `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")`. Ne martelez pas la révélation — générez une fois, puis réutilisez le proof.

## ⚙️ Options du CLI

| option | signification |
| --- | --- |
| `--count N` | comptes (= clés) à générer (défaut 1) |
| `--auto` | résoudre le Cloudflare Turnstile dans un vrai Chrome automatiquement (**activé par défaut** ; `--no-auto` le désactive) |
| `--dry` | afficher le plan résolu et quitter (aucun compte, aucun fichier, aucun réseau) |
| `--pool FILE` | liste de sorties, un proxy par ligne (défaut `proxies.txt` si présent ; `INFINITYROUTER_POOL`) |
| `--proxy URL` | une seule sortie pour toutes les requêtes |
| `--exits K` | sorties candidates essayées par compte (défaut 3) |
| `--model ID` | modèle utilisé pour le verrou en direct (défaut `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | groupe de token dans lequel la clé est créée (défaut `free`) |
| `--port N` | port Chrome DevTools (défaut : un port libre) |
| `--browser PATH` | binaire Chrome (`CHROME_PATH`) |
| `--headless` | **non recommandé** — Cloudflare ne se franchit que dans un navigateur visible |
| `--keep` | laisser Chrome ouvert à la fin de l'exécution |
| `--verify-only` | revérifier chaque clé de `keys.txt`, ne rien générer |

Zéro dépendance ; Node.js ≥ 22 pour le `WebSocket` et `fetch` globaux.

## 🛰️ Derrière un proxy

Votre liste de proxys est **facultative** — passez `--pool proxies.txt` et chaque tentative obtient son propre Chrome lancé avec `--proxy-server` sur la sortie de cette tentative, de sorte que chaque requête faite par ce compte (page, résolution Turnstile, appels au panneau, verrou de chat) sort par une seule adresse. Sans pool, le CLI se connecte directement, ce qui est aussi le moyen le plus rapide de découvrir que le token Turnstile et sa dépense doivent partager une sortie. Les sorties `http`, `socks5` et `socks4` sont acceptées ; les identifiants ne sont pas pris en charge.

## 📄 Fichiers

| fichier | quoi |
| --- | --- |
| `keys.txt` | clés ayant passé le verrou en direct, une par ligne |
| `accounts.json` | enregistrement compte ↔ sortie ↔ proof (écrit au fur et à mesure) |
| `keys-dead.txt` | clés générées mais n'ayant jamais passé le verrou en direct — matière à réessai |
| `src/solver.js` | le moteur navigateur + Cloudflare Turnstile derrière `--auto` |
| `repo-spec.json` | cette spécification d'empaquetage |
| `public-cli.js` | mint / verify (node stdlib uniquement) |
| `out/evidence-20261021.json` | la chaîne mesurée : verrous, chaîne, chat, modèles, revérifications |
| `out/mint-20261021-state.json` | l'état propre du mint |

## 🔌 Se connecter à 9Router

À ajouter à 9Router comme fournisseur personnalisé compatible OpenAI :

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

`src/connect-9router.js` enregistre exactement ceci, et le lanceur le propose. Les clients au format Anthropic pointent vers l'hôte nu (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 Se connecter à OmniRoute

À ajouter à OmniRoute comme fournisseur personnalisé compatible OpenAI :

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

`src/connect-omniroute.js` enregistre exactement ceci, et le lanceur le propose. Les clients au format Anthropic pointent vers l'hôte nu (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 Ce que le fournisseur donne | Cloudflare Turnstile franchi dans un vrai Chrome, une étape de security proof dépensée sur la révélation de la clé — et le groupe `free` répond chat-200 sans aucun quota |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 2 identifiants de modèles sur le point de terminaison ci-dessous, aux limites de votre offre. Le quota vit sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Vos données | seuls infinityrouter.dev et le backend de boîte mail que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

* **Le groupe, pas le modèle, décide de l'accès.** Le groupe `free` du compte est ce qui fait répondre les deux modèles alors que `quota` vaut 0 et que la facturation est `subscription_only`. Une clé créée dans un autre groupe ne verra pas le même ensemble.
* **`/api/verify` est limité en débit par utilisateur.** Un 429 y revient avec un **corps vide** et un `retry-after` autour de 440–464 s — le même TTL depuis chaque sortie, donc la rotation de proxys ne le réinitialise pas. Attendez la fin ; la révélation elle-même est intacte.
* **Une regex de mail limitée aux chiffres est erronée.** Le code fait 6 caractères HEX et le message porte des couleurs CSS (`404040`, `575757`) qu'un motif `\d{6}` acceptera volontiers — cette erreur a brûlé six tentatives le 2026-10-18.
* **Les tokens Turnstile sont liés à l'IP et à usage unique.** Résoudre sur un réseau et dépenser depuis un autre échoue avec `Turnstile verification failed` ; le CLI ne les sépare jamais.
* **La session est courte.** L'`access_token` de la console dure 899 s et une reconnexion nécessite un nouveau token Turnstile, donc une exécution qui reste inactive en milieu de chaîne doit recommencer.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey contributors

</div>