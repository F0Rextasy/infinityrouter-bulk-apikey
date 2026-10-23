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

**API anahtarlarıyla toplu InfinityRouter hesabı oluşturma — açığa çıkarma işlemi için `X-Security-Proof` adım yükseltmesi gerektiren bir New API çatalı, artı bir 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://infinityrouter.dev)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-2-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

InfinityRouter (`infinityrouter.dev`), `subscription_only` faturalandırmaya bağlı bir **New API çatalıdır** (`QuantumNous/new-api v1.0.0-rc.34+`): satışta olan tek planlar **aylık $39 / $69 / $129**, yeni bir hesap `quota: 0` alır, giriş kontrolü kapalıdır ve ücretsiz ya da deneme planı yoktur. Bunların hiçbiri, hesabın kendi **`free` grubundaki** iki modelin yanıt vermesini engellemez: 2026-10-21'de ölçüldüğü üzere, `minimax-m3` (oran 0.1) ve `deepseek-v4.1-flash-1017` (oran 0.02) kullanım bilgisiyle birlikte tekrar tekrar `chat-200` döndürür (`GET /v1/models` → 200, 2 model).

Sizinle bir anahtar arasında iki kapı var ve ikisi de atlanmak yerine çözüldü:

1. **Cloudflare Turnstile**, `GET /api/verification`, `POST /api/user/register` ve `POST /api/user/login` üzerinde (`{"message":"Turnstile token is empty"}` / `"Turnstile verification failed"`). Token sorgu dizesiyle taşınır, tek kullanımlıktır ve çözen IP'ye bağlıdır (`siteverify` `remoteip`) — yani onu üreten tarayıcı, aynı çıkıştan harcamalıdır. Panel kendi sitekey'ini `GET /api/status → data.turnstile_site_key` adresinde yayınlar (ölçülen: `0x4AAAAAAFTBBpiFBKxXCi-q`); CLI, çıkışınıza sabitlenmiş gerçek bir görünür Chrome'u çalıştırır ve sayfanın onu üretmesini sağlar.
2. **Anahtar açığa çıkarmada bir "güvenlik kanıtı" adım yükseltmesi.** Tek başına `POST /api/token/<id>/key` **403 `SECURITY_PROOF_REQUIRED`** döndürür. `POST /api/verify {method:"password",password,scope:"token.key.read",context:{"token_id":<id>}}` çağrısı `data.proof_token` döndürür ve aynı açığa çıkarma işlemi `X-Security-Proof: <proof_token>` ile tekrarlandığında 200 ve düz metin anahtarı döndürür. Yanlış kapsam → `SECURITY_PROOF_SCOPE_MISMATCH`, bağlam olmadan doğru kapsam → 400 `SECURITY_CONTEXT_INVALID`, kanıt yerine bir JWT → `SECURITY_PROOF_INVALID`.

2026-10-18'de bir tuzak daha altı denemeye mal oldu: posta kodu **6 HEX karakterdir**, bu yüzden yalnızca rakamlara bakan bir regex mesajdaki CSS rengi `404040` / `575757` değerini rahatça okur ve panel *"Verification code is incorrect or has expired"* yanıtını verir. CLI `[0-9a-f]{6}` kullanır ve renkleri yok sayar.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

| Ne | Değer |
| --- | --- |
| Kayıt kotası | **0** (`new_user_quota: 0`) — ödenek bir bakiye değil, `free` grubudur |
| Faturalandırma modu | `billing_preference: "subscription_only"`; planlar **Infinity Basic $39 / Pro $69 / Max $129 aylık**, ücretsiz ya da deneme planı yok |
| Ücretsiz/deneme planı | **yok** (`free_plan: null`) |
| Günlük giriş kontrolü | **kapalı** (`checkin_enabled: false`) |
| Hesap grubu | `free` — token grubu `auto` yeniden bağlamaya gerek duymaz |
| Konuşulabilir modeller | `minimax-m3` (oran **0.1**), `deepseek-v4.1-flash-1017` (oran **0.02**) |
| En ucuz giriş | `deepseek-v4.1-flash-1017`, oran 0.02 |
| Grup oranları | `free` 1, `basic` 1, `pro` 1, `max` 1 |

> **Kapı model tabanlı değil, grup tabanlıdır**: hesabın `free` grubu modelleri önceden tüketilmez, bu yüzden panelin kendi cüzdanı boşken bile yanıt verirler.

> 💡 Ücretsiz katman InfinityRouter tarafından belirlenir ve değişebilir. Canlı sayıları [infinityrouter.dev](https://infinityrouter.dev) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # keys.txt içindeki her anahtar gerçek bir sohbet çağrısıyla yeniden test edilir
```

## 🤖 Modeller — ikisi de

Yeni bir `free` grubu anahtarıyla `GET /v1/models` **2 model** döndürür (`providers/infinityrouter/out/evidence-20261021.json`, `models_probe` → 200, `count: 2`):

* `minimax-m3` — oran 0.1, CLI'nin varsayılan kapı modeli
* `deepseek-v4.1-flash-1017` — oran 0.02, en ucuz

`/v1/models` listesini anahtarın grubu belirler; bu paneldeki `auto_groups` `basic` / `pro` / `max` şeklindedir, yani ücretli bir plan kümeyi genişletir, ancak bu depodaki her şey yeni bir hesabın doğduğu `free` grubuyla ölçülmüştür.

## 🧪 API nasıl kullanılır

Temel URL **`https://infinityrouter.dev/v1`** — OpenAI uyumludur, yani OpenAI konuşan her şey çalışır (SDK'lar, Cursor, OpenCode, Kilo Code, …). Anthropic biçimli istemciler çıplak ana makineyi `/v1/messages` ile kullanır.

```bash
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

* anahtarlar **48 karakterlik base62**'dir; konsol bunları `sk-` önekiyle gösterir ve `/v1` üzerinde **her iki biçim de kabul edilir**
* hesabın `access_token` değeri yalnızca **899 sn (~15 dk)** yaşar ve yeniden giriş yine Turnstile gerektirir — CLI, zinciri daha sonra sürdürmek yerine tek çalıştırmada tamamlar
* CLI'yi havuz olmadan çalıştırmak doğrudan bağlanır; bir proxy listesi her hesabın tek bir çıkışta çözmesini ve harcamasını sağlar

## 🛠 Hızlı başlangıç

```bash

# 1) bir hesap + bir anahtar, uçtan uca kapılı (gerçek Chrome + Cloudflare Turnstile)
node src/cli.js --count 1 --pool proxies.txt

# 2) keys.txt içindeki her anahtarı yeniden kanıtla (modeller + iki farklı sohbet + bir get_time araç çağrısı)
node src/cli.js --verify-only

# 3) onunla konuş
curl https://infinityrouter.dev/v1/chat/completions \
  -H "Authorization: Bearer $INFINITYROUTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"say ok"}],"max_tokens":8}'
```

`--pool` dosyası isteğe bağlıdır: o olmadan araç doğrudan çalışır. Onunla birlikte, her deneme için bir tarayıcı başlatılır ve o denemenin çıkışına sabitlenir — aynı adres Turnstile token'ını çözer ve harcar, panel de bunu zorunlu kılar.

### 🖱️ Başlatıcı

`src/launcher.js` (bu README ile aynı banner) üretimin ihtiyaç duyduğu birkaç yanıtı sorar — kaç hesap, çıkış listesi, kapı modeli — bunları `launcher.config.json` içinde hatırlar ve ardından `src/cli.js` dosyasını çalıştırır. Aynı CLI'dır, sadece bayrakları ezberlemeye gerek yoktur.

## ✅ Doğrulandı — her anahtar test edilir

Laboratuvar çalıştırması 2026-10-21 (hesap kimliği 41 / `ina49d3b`, WARP çıkışı `104.28.216.172`), tam zincir: sayfa içinde Turnstile token'ı üretildi → `GET /api/verification` 200 `success:true` → 6-HEX postadan `33b068` kodu okundu (teslimat ≤13 sn, TTL 10 dk) → `POST /api/user/register` 200 → `POST /api/user/login` 200 (JWT, 899 sn) → token oluşturuldu → açığa çıkarma `X-Security-Proof` ile adım yükseltildi → anahtar `lKT1XLW8n2S1…` (48 karakter).

Ardından kapı, iki kez yeniden çalıştırıldı: `GET /v1/models` → **200, 2 model**; `minimax-m3` ve `deepseek-v4.1-flash-1017` her ikisi de **HTTP 200 ve `content:"ok"`**, hem ilk yoklamada hem de her iki yeniden doğrulamada. Kanıt: `providers/infinityrouter/out/evidence-20261021.json` (`chat`, `models_probe`, `reverify`), durum `providers/infinityrouter/out/mint-20261021-state.json`; yazı `proxy-lab/out/infinityrouter-20261021.md`.

> **Kalite kapıları.** Buradaki her anahtar `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> başarısızlıklar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
gelen kutusu (hesap başına bir adres)                            her hesap için yeni bir adres
   │
   ├─▶ kayıt: InfinityRouter sayfası → e-posta adresi → gelen kutusundan kod / bağlantı
   ├─▶ oturum: hesabın çerezleri veya erişim token'ı elde
   ├─▶ anahtar üretimi: hesabın anahtar uç noktası → düz metin anahtar bir kez döndürülür (hemen diske yazılır)
   └─▶ canlı kanıt: POST https://infinityrouter.dev/v1/chat/completions → gerçek içerik = anahtar canlı
```

Kayıt, hesap başına:

1. **sayfa** — havuzunuzdan bir çıkışta gerçek (görünür) bir Chrome `/register` adresini açar. Cloudflare'in geçiş sayfası tarayıcı diline göre yerelleştirilir, bu yüzden CLI `--lang=en-US` sabitler.
2. **sitekey** — `GET /api/status → data.turnstile_site_key` (panelin kendi anahtarı; CLI yalnızca `/api/status` erişilemezse ölçülen sabite geri döner).
3. **Turnstile** — sayfanın kendi widget'ı token'ı üretir; token çözen IP'ye bağlıdır (`siteverify` `remoteip`), yani **çözen çıkış = harcayan çıkış**. CLI, onay kutusuna ulaşmak için widget'ı kapalı shadow root'lar boyunca gezer.
4. **posta kutusu** — bir temp.tf hotmail/outlook **artı takma adı**, hesap başına bir yeni adres.
5. **kod** — `GET /api/verification?email=&turnstile=` → panel `Your verification code is: <strong>26995f</strong>` postalar. **6 HEX karakter** okuyun (yalnızca rakam değil: aynı mesajda `404040`/`575757` CSS renkleri vardır); 10 dk geçerli, ≤13 sn içinde teslim edilir.
6. **kayıt + giriş** — `POST /api/user/register?turnstile=` ardından `POST /api/user/login?turnstile=` → konsol Bearer JWT'si artı `new_api_refresh` çerezi (yenileme çerezi `/api/user/auth` yolunda `HttpOnly`'dir, bu yüzden girişte yakalanmalıdır).
7. **anahtar** — `group=free` içinde token oluşturulur, ardından adım yükseltmesiyle açığa çıkarılır: `POST /api/verify {scope:'token.key.read', context:{token_id}}` → `data.proof_token` → `X-Security-Proof` ile `POST /api/token/<id>/key`.
8. **kapı** — `/v1/chat/completions` yalnızca `/v1/models` 200 ise, **iki farklı istem iki farklı boş olmayan metin döndürürse** ve bir `get_time` araç çağrısı geri gelirse sayılır. Bir anahtar ancak bundan sonra `keys.txt` dosyasına eklenir; başarısız olan `accounts.json` içine kaydedilir ve sonraki çalıştırmada yeniden denenir.

> `/api/verify` **kullanıcı başına** hız sınırlıdır (boş gövdeyle 429 ve `retry-after` ~440–464 sn; dört farklı çıkışta aynı ölçüldü, oysa `/api/user/self` her birinde 200 kaldı). Bu, `middleware.CriticalRateLimit()` + `UserCriticalRateLimit("security-verification")` şeklindedir. Açığa çıkarmayı dövmeyin — bir kez üretin, sonra kanıtı yeniden kullanın.

## ⚙️ CLI seçenekleri

| bayrak | anlamı |
| --- | --- |
| `--count N` | üretilecek hesap (= anahtar) sayısı (varsayılan 1) |
| `--pool FILE` | çıkış listesi, satır başına bir proxy (varsa varsayılan `proxies.txt`; `INFINITYROUTER_POOL`) |
| `--proxy URL` | her istek için tek bir çıkış |
| `--exits K` | hesap başına denen çıkış adayı (varsayılan 3) |
| `--model ID` | canlı kapı için kullanılan model (varsayılan `minimax-m3`, `INFINITYROUTER_MODEL`) |
| `--group NAME` | anahtarın oluşturulduğu token grubu (varsayılan `free`) |
| `--port N` | Chrome DevTools bağlantı noktası (varsayılan: boş bir tane) |
| `--browser PATH` | Chrome ikili dosyası (`CHROME_PATH`) |
| `--headless` | **önerilmez** — Cloudflare yalnızca görünür bir tarayıcıda temizlenir |
| `--keep` | çalıştırma bittiğinde Chrome'u açık bırak |
| `--verify-only` | `keys.txt` içindeki her anahtarı yeniden kanıtla, hiçbir şey üretme |

Sıfır bağımlılık; global `WebSocket` ve `fetch` için Node.js ≥ 22.

## 🛰️ Proxy arkasında

Proxy listeniz **isteğe bağlıdır** — `--pool proxies.txt` verin ve her deneme, o denemenin çıkışında `--proxy-server` ile başlatılan kendi Chrome'unu alır, böylece o hesabın yaptığı her istek (sayfa, Turnstile çözümü, panel çağrıları, sohbet kapısı) tek bir adresten çıkar. Havuz olmadan CLI doğrudan bağlanır; bu da Turnstile token'ının ve harcamasının aynı çıkışı paylaşması gerektiğini keşfetmenin en hızlı yoludur. `http`, `socks5` ve `socks4` çıkışları kabul edilir; kimlik bilgileri desteklenmez.

## 📄 Dosyalar

| dosya | ne |
| --- | --- |
| `keys.txt` | canlı kapıyı geçen anahtarlar, satır başına bir tane |
| `accounts.json` | hesap ↔ çıkış ↔ kanıt kaydı (ilerledikçe yazılır) |
| `repo-spec.json` | bu paketleme belirtimi |
| `public-cli.js` | üret / doğrula (yalnızca node stdlib) |
| `out/evidence-20261021.json` | ölçülen zincir: kapılar, zincir, sohbet, modeller, yeniden doğrulamalar |
| `out/mint-20261021-state.json` | üretimin kendi durumu |

## 🔌 9Router'a bağlan

9Router'a özel bir OpenAI uyumlu sağlayıcı olarak ekleyin:

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

`src/connect-9router.js` tam olarak bunu kaydeder ve başlatıcı bunu sunar. Anthropic biçimli istemciler çıplak ana makineyi işaret eder (`https://infinityrouter.dev`, `/v1/messages`).

## 🔌 OmniRoute'a bağlan

OmniRoute'a özel bir OpenAI uyumlu sağlayıcı olarak ekleyin:

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

`src/connect-omniroute.js` tam olarak bunu kaydeder ve başlatıcı bunu sunar. Anthropic biçimli istemciler çıplak ana makineyi işaret eder (`https://infinityrouter.dev`, `/v1/messages`).

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **InfinityRouter** — [infinityrouter.dev](https://infinityrouter.dev) |
| 🎁 Sağlayıcının verdikleri | Gerçek bir Chrome'da yenilen Cloudflare Turnstile, anahtar açığa çıkarmada harcanan bir güvenlik kanıtı adım yükseltmesi — ve `free` grubu hiç kota olmadan chat-200 yanıtlıyor |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktadaki 2 model kimliği, planınızın sınırlarında. Kota **hesapta** yaşar, bu aracın anahtar başına bir hesap oluşturmasının nedeni de tam olarak budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://infinityrouter.dev/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca infinityrouter.dev ve yapılandırdığınız gelen kutusu arka ucuna bağlanılır; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

* **Erişimi model değil, grup belirler.** Hesabın `free` grubu, `quota` 0 ve faturalandırma `subscription_only` iken iki modelin yanıt vermesini sağlayan şeydir. Başka bir grupta oluşturulan bir anahtar aynı kümeyi görmez.
* **`/api/verify` kullanıcı başına hız sınırlıdır.** Oradaki bir 429 **boş gövdeyle** ve yaklaşık 440–464 sn'lik bir `retry-after` ile döner — her çıkışta aynı TTL, yani proxy döndürmek bunu sıfırlamaz. Bekleyin; açığa çıkarmanın kendisi sorunsuzdur.
* **Yalnızca rakamlara bakan posta regex'i yanlıştır.** Kod 6 HEX karakterdir ve mesajda bir `\d{6}` deseninin memnuniyetle kabul edeceği CSS renkleri (`404040`, `575757`) bulunur — bu hata 2026-10-18'de altı denemeyi yaktı.
* **Turnstile token'ları IP'ye bağlıdır ve tek kullanımlıktır.** Bir ağda çözüp başka bir ağdan harcamak `Turnstile verification failed` ile başarısız olur; CLI bunları asla ayırmaz.
* **Oturum kısadır.** Konsol `access_token` değeri 899 sn sürer ve yeniden giriş yeni bir Turnstile token'ı gerektirir, bu yüzden zincirin ortasında bekleyen bir çalıştırma baştan başlamalıdır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 infinityrouter-bulk-apikey katkıda bulunanlar

</div>