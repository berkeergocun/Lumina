# SmartAnalytics — Backend PRD (Product Requirements Document)

**Versiyon:** 1.0.0  
**Tarih:** 28 Şubat 2026  
**Durum:** Taslak  
**Sorumlu Ekip:** Backend / Platform  

---

## 1. Ürün Özeti

SmartAnalytics Backend; web sitesi sahiplerine gerçek zamanlı ziyaretçi takibi, oturum analizi, özel etkinlik yönetimi ve kapsamlı raporlama imkânı sunan, gizlilik odaklı (GDPR uyumlu) bir analitik platformunun sunucu katmanıdır.

**Teknoloji Yığını:**

| Katman | Teknoloji |
|---|---|
| Runtime | Bun.js (≥ 1.1) |
| Web Framework | Elysia.js (≥ 1.0) |
| Primer Veritabanı | MongoDB (≥ 7.0) |
| Önbellek / Gerçek Zamanlı | Redis (≥ 7.2) |
| Kimlik Doğrulama | JWT (RS256) + Refresh Token |
| Takip Betiği | Vanilla JS snippet (< 2 KB gzip) |
| API Standardı | REST + Server-Sent Events (SSE) |
| Konteyner | Docker + Docker Compose |

---

## 2. Hedefler ve Başarı Kriterleri

### 2.1 İş Hedefleri

- Google Analytics'e bağımlılığı azaltmak isteyen küçük-orta ölçekli işletmelere self-hosted çözüm sunmak.  
- Kullanıcı verilerini üçüncü taraflarla paylaşmadan kolayca toplayabilmek.  
- Reklam engelleyiciler tarafından engellenmemeyi destekleyen birinci taraf (first-party) veri toplama modeli sunmak.

### 2.2 Başarı Kriterleri (KPI)

| Metrik | Hedef |
|---|---|
| Sayfa görüntüleme kaydı (write) gecikmesi | < 50 ms (p99) |
| Gerçek zamanlı aktif kullanıcı gecikmesi | < 2 s |
| API yanıt süresi (okuma, önbellekli) | < 30 ms (p95) |
| Sistem erişilebilirliği | ≥ 99.9 % |
| Günlük kaydedilebilir olay kapasitesi (tek node) | ≥ 5 M |

---

## 3. Kullanıcı Profilleri

| Rol | Açıklama |
|---|---|
| **Site Sahibi (Admin)** | Platform hesabı açar, web sitesi ekler, betik alır |
| **Analist (Viewer)** | Raporları okur, dışa aktarır; veri yazamaz |
| **Tracker (anonim)** | Takip betiği aracılığıyla veri gönderir; oturum açmaz |
| **Sistem (Cron)** | Periyodik toplulaştırma ve temizleme işleri |

---

## 4. Kapsam Dışı (Out of Scope) — v1.0

- A/B Test yönetimi  
- Reklam attribution (Google Ads, Meta Ads entegrasyonu)  
- Mobil SDK (iOS / Android)  
- Makine öğrenmesi tabanlı anormallik tespiti (v2 planlanıyor)  

---

## 5. Fonksiyonel Gereksinimler

### 5.1 Kimlik Yönetimi ve Oturum (Auth)

| ID | Gereksinim |
|---|---|
| AUTH-01 | Kullanıcı e-posta + şifre ile kayıt olabilmeli (bcrypt, cost ≥ 12) |
| AUTH-02 | Giriş başarılıysa Access Token (15 dk TTL) + Refresh Token (30 gün TTL) dönmeli |
| AUTH-03 | Refresh Token rotasyonu uygulanmalı; eski token Redis'te kara listeye alınmalı |
| AUTH-04 | Şifre sıfırlama e-posta ile token tabanlı yapılmalı (1 saatlik TTL) |
| AUTH-05 | OAuth 2.0 Google bağlantısı (v1.1'e ertelendi) |
| AUTH-06 | API Key oluşturma / iptal etme (site sahipleri için takip dışı API erişimi) |

### 5.2 Web Sitesi (Property) Yönetimi

| ID | Gereksinim |
|---|---|
| PROP-01 | Kullanıcı birden fazla site kaydedebilmeli |
| PROP-02 | Her site için benzersiz `siteId` (nanoid, 12 karakter) ve gömülecek JS betiği üretilmeli |
| PROP-03 | Domain doğrulaması: DNS TXT kaydı veya HTML meta etiketi ile yapılabilmeli |
| PROP-04 | Site silindiğinde ilgili tüm olaylar soft-delete ile 90 gün saklanmalı |
| PROP-05 | Beyaz liste alan adı kontrolü: sadece kayıtlı domainlerden gelen istekler kabul edilmeli |

### 5.3 Veri Toplama (Ingestion)

| ID | Gereksinim |
|---|---|
| ING-01 | `POST /api/v1/collect` endpoint'i anonimleştirilmiş olay verilerini almalı |
| ING-02 | Desteklenen olay tipleri: `pageview`, `custom_event`, `session_start`, `session_end` |
| ING-03 | IP adresi sunucu tarafında coğrafi veriye dönüştürülmeli, ham IP **kesinlikle saklanmamalı** |
| ING-04 | User-Agent ayrıştırılarak tarayıcı, OS, cihaz tipi çıkarılmalı ve ham UA saklanmamalı |
| ING-05 | UTM parametreleri (source, medium, campaign, term, content) ayrıştırılıp saklanmalı |
| ING-06 | Bot/crawler tespiti için User-Agent ve davranış tabanlı filtreleme uygulanmalı |
| ING-07 | Gelen istek önce Redis'e yazılmalı (write buffer), ardından arka planda MongoDB'ye flush edilmeli |
| ING-08 | Rate limiting: aynı IP'den 5 sn içinde > 20 istek → 429 dön |
| ING-09 | Payload boyutu ≤ 16 KB olmalı; aşanlar reddedilmeli |

### 5.4 Oturum (Session) Yönetimi

| ID | Gereksinim |
|---|---|
| SESS-01 | Oturum kimliği istemci tarafından UUID v4 olarak üretilmeli; sunucu sadece doğrulamalı |
| SESS-02 | 30 dakika eylemsizlik sonrası oturum otomatik kapanmalı (Redis TTL ile yönetilmeli) |
| SESS-03 | Oturum başlangıç / bitiş zamanı, toplam sayfa görüntüleme sayısı ve oturum süresi hesaplanmalı |
| SESS-04 | Bounce rate: tek sayfalık oturumlar otomatik işaretlenmeli |

### 5.5 Raporlama API'si

#### Genel Dashboard Metrikleri — `GET /api/v1/reports/overview`

- Benzersiz ziyaretçi sayısı  
- Sayfa görüntüleme sayısı  
- Oturum sayısı  
- Ortalama oturum süresi  
- Bounce rate  
- Yeni vs. geri dönen ziyaretçi oranı  

#### Boyut Raporları

| Endpoint | Döndürülen Boyutlar |
|---|---|
| `GET /api/v1/reports/pages` | URL, başlık, görüntülenme, benzersiz gz., çıkış oranı |
| `GET /api/v1/reports/sources` | Referrer, UTM source/medium, doğrudan/organik/sosyal |
| `GET /api/v1/reports/geo` | Ülke, şehir (yaklaşık) |
| `GET /api/v1/reports/devices` | Tarayıcı, OS, cihaz tipi, çözünürlük |
| `GET /api/v1/reports/events` | Özel etkinlik adı, sayım, benzersiz kullanıcı |

#### Zaman Serisi — `GET /api/v1/reports/timeseries`

- Granülarite: `hour`, `day`, `week`, `month`  
- Tarih filtresi: `from` / `to` (ISO 8601)  

#### Gerçek Zamanlı — `GET /api/v1/realtime/stream` (SSE)

- Şu an aktif kullanıcı sayısı (son 5 dakika)  
- Aktif sayfalar ve ziyaretçi dağılımı  
- Güncelleme sıklığı: 5 saniye  

### 5.6 Özel Etkinlik (Custom Event) API'si

| ID | Gereksinim |
|---|---|
| EVT-01 | Betik üzerinden `analytics.track(eventName, properties)` çağrısı ile özel etkinlik kaydedilebilmeli |
| EVT-02 | Etkinlik adı max 64 karakter, alfanümerik + tire + alt çizgi |
| EVT-03 | Properties objesi max 10 alan, her değer max 256 karakter string veya sayı olabilmeli |
| EVT-04 | Etkinlik bazlı dönüşüm hunisi (funnel) raporu v1.1'e ertelendi |

### 5.7 Dışa Aktarma (Export)

| ID | Gereksinim |
|---|---|
| EXP-01 | CSV ve JSON formatında dışa aktarma |
| EXP-02 | Maksimum dışa aktarma satırı: 500.000 |
| EXP-03 | Büyük exportlar asenkron işlenmeli, tamamlanınca indirilabilir URL üretilmeli |

---

## 6. Veri Modeli

### 6.1 MongoDB Koleksiyonları

#### `users`
```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "passwordHash": "string",
  "name": "string",
  "role": "owner | viewer",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isVerified": "boolean",
  "twoFactorEnabled": "boolean"
}
```

#### `sites`
```json
{
  "_id": "ObjectId",
  "siteId": "string (nanoid, unique)",
  "ownerId": "ObjectId → users",
  "name": "string",
  "domain": "string",
  "timezone": "string (IANA)",
  "isVerified": "boolean",
  "verificationToken": "string",
  "createdAt": "Date",
  "deletedAt": "Date | null"
}
```

#### `events`
```json
{
  "_id": "ObjectId",
  "siteId": "string",
  "sessionId": "string (UUID v4)",
  "type": "pageview | custom_event | session_start | session_end",
  "name": "string | null",
  "properties": "object | null",
  "url": "string",
  "referrer": "string | null",
  "utm": {
    "source": "string | null",
    "medium": "string | null",
    "campaign": "string | null",
    "term": "string | null",
    "content": "string | null"
  },
  "geo": {
    "country": "string",
    "city": "string",
    "region": "string"
  },
  "device": {
    "browser": "string",
    "browserVersion": "string",
    "os": "string",
    "osVersion": "string",
    "type": "desktop | mobile | tablet",
    "screenWidth": "number | null",
    "screenHeight": "number | null"
  },
  "timestamp": "Date",
  "isBot": "boolean"
}
```

#### `sessions`
```json
{
  "_id": "ObjectId",
  "sessionId": "string",
  "siteId": "string",
  "startedAt": "Date",
  "endedAt": "Date | null",
  "duration": "number (seconds)",
  "pageviews": "number",
  "isBounce": "boolean",
  "entryUrl": "string",
  "exitUrl": "string | null",
  "geo": { "country": "string", "city": "string" },
  "device": { "type": "string", "browser": "string", "os": "string" },
  "referrer": "string | null",
  "utm": { "source": "string | null", "medium": "string | null" }
}
```

#### `daily_aggregates`
```json
{
  "_id": "ObjectId",
  "siteId": "string",
  "date": "Date (YYYY-MM-DD)",
  "pageviews": "number",
  "sessions": "number",
  "uniqueVisitors": "number",
  "bounceRate": "number",
  "avgSessionDuration": "number",
  "byPage": [{ "url": "string", "views": "number" }],
  "byCountry": [{ "code": "string", "sessions": "number" }],
  "bySource": [{ "source": "string", "sessions": "number" }],
  "byDevice": [{ "type": "string", "sessions": "number" }],
  "byBrowser": [{ "name": "string", "sessions": "number" }]
}
```

### 6.2 MongoDB İndeksleri

```js
// events koleksiyonu
db.events.createIndex({ siteId: 1, timestamp: -1 })
db.events.createIndex({ siteId: 1, type: 1, timestamp: -1 })
db.events.createIndex({ sessionId: 1 })
db.events.createIndex({ timestamp: 1 }, { expireAfterSeconds: 63072000 }) // 2 yıl TTL

// sessions koleksiyonu
db.sessions.createIndex({ siteId: 1, startedAt: -1 })
db.sessions.createIndex({ sessionId: 1 }, { unique: true })

// daily_aggregates
db.daily_aggregates.createIndex({ siteId: 1, date: -1 }, { unique: true })
```

### 6.3 Redis Yapıları

| Anahtar Deseni | Tip | TTL | Açıklama |
|---|---|---|---|
| `session:{sessionId}` | Hash | 30 dk | Aktif oturum verisi |
| `realtime:{siteId}:active` | Sorted Set | — | Aktif kullanıcılar (score = timestamp) |
| `realtime:{siteId}:pages` | Hash | 5 dk | Şu an izlenen sayfalar |
| `ratelimit:{ip}` | String (counter) | 5 sn | Rate limiting sayacı |
| `blacklist:token:{jti}` | String | token TTL | İptal edilmiş refresh token |
| `ingestion:buffer:{siteId}` | List | — | Geçici olay tamponu |
| `cache:report:{siteId}:{hash}` | String (JSON) | 5 dk | Rapor önbelleği |

---

## 7. API Tasarımı

### 7.1 Base URL

```
https://api.smartanalytics.io/api/v1
```

### 7.2 Endpoint Listesi

#### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
```

#### Sites (Property)
```
GET    /sites
POST   /sites
GET    /sites/:siteId
PUT    /sites/:siteId
DELETE /sites/:siteId
POST   /sites/:siteId/verify
GET    /sites/:siteId/snippet
```

#### Veri Toplama (public, no auth)
```
POST   /collect
GET    /collect/ping    (1x1 GIF fallback opsiyonu)
```

#### Raporlar (kimlik doğrulamalı)
```
GET    /reports/overview?siteId=&from=&to=
GET    /reports/timeseries?siteId=&from=&to=&granularity=
GET    /reports/pages?siteId=&from=&to=&limit=&offset=
GET    /reports/sources?siteId=&from=&to=
GET    /reports/geo?siteId=&from=&to=
GET    /reports/devices?siteId=&from=&to=
GET    /reports/events?siteId=&from=&to=
GET    /realtime/stream?siteId=   (SSE)
```

#### Export
```
POST   /export/csv
POST   /export/json
GET    /export/:jobId/status
GET    /export/:jobId/download
```

#### Admin (role: owner)
```
GET    /admin/users
DELETE /admin/users/:userId
GET    /admin/stats
```

### 7.3 Hata Yanıtı Şeması

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SITE_ID",
    "message": "Geçersiz site kimliği.",
    "details": {}
  }
}
```

### 7.4 Başarı Yanıtı Şeması

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1024
  }
}
```

---

## 8. Takip Betiği (Tracker Script)

### 8.1 Gereksinimler

| ID | Gereksinim |
|---|---|
| TRK-01 | Gzip sıkıştırılmış boyut ≤ 2 KB |
| TRK-02 | Sıfır bağımlılık (vanilla JS, ES2017+) |
| TRK-03 | `async` + `defer` ile asenkron yüklenebilmeli |
| TRK-04 | SPA (Single Page Application) desteği: History API değişikliklerini dinlemeli |
| TRK-05 | `navigator.sendBeacon` API ile sayfa kapanırken veri kaybı olmamalı |
| TRK-06 | `Do Not Track` başlığına saygı duyulmalı (yapılandırılabilir) |
| TRK-07 | Local Storage ile ziyaretçi kimliğini 1 yıl saklayabilmeli |

### 8.2 Örnek Entegrasyon

```html
<script
  async
  defer
  src="https://cdn.smartanalytics.io/tracker.js"
  data-site-id="abc123xyz456"
></script>
```

### 8.3 Özel Etkinlik API'si

```js
SmartAnalytics.track('button_click', { button: 'signup', plan: 'pro' });
SmartAnalytics.identify('user-123'); // anonim ID ile eşleme
```

---

## 9. Güvenlik Gereksinimleri

| ID | Gereksinim |
|---|---|
| SEC-01 | Tüm trafik HTTPS (TLS 1.2+) üzerinden olmalı |
| SEC-02 | CORS: sadece kayıtlı domainlere ve dashboard'a izin verilmeli |
| SEC-03 | OWASP Top 10 güvenlik açıklarına karşı önlem alınmalı |
| SEC-04 | SQL/NoSQL injection'a karşı tüm girişler doğrulanmalı (Elysia TypeBox) |
| SEC-05 | Hassas veriler (hash, token) response body'de asla dönmemeli |
| SEC-06 | Helmet.js eşdeğeri HTTP güvenlik başlıkları uygulanmalı |
| SEC-07 | Admin endpoint'leri IP kısıtlaması ile korunabilmeli |
| SEC-08 | GDPR: kişisel veri saklanmamalı; IP hash, UA hash kullanılmalı |
| SEC-09 | DDoS koruması için rate limiting katmanı Redis tabanlı uygulanmalı |

---

## 10. Performans Gereksinimleri

| Senaryo | Hedef |
|---|---|
| Olay yazma (tek istek) | < 10 ms (Redis buffer'a yazma) |
| Rapor okuma (önbellekli) | < 30 ms |
| Rapor okuma (soğuk, 30 günlük) | < 800 ms |
| SSE gerçek zamanlı bağlantı | ≤ 500 eşzamanlı bağlantı/node |
| MongoDB aggregation (günlük) | < 5 sn |
| Redis buffer → MongoDB flush | Her 5 sn veya 1000 kayıt |

---

## 11. Dosya ve Proje Yapısı

```
backend/
├── src/
│   ├── index.ts                  # Uygulama başlangıç noktası
│   ├── app.ts                    # Elysia app tanımı ve plugin kaydı
│   ├── config/
│   │   ├── env.ts                # Ortam değişkeni doğrulama (Zod)
│   │   ├── mongodb.ts            # MongoDB bağlantısı
│   │   └── redis.ts              # Redis bağlantısı
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.middleware.ts
│   │   ├── sites/
│   │   │   ├── sites.routes.ts
│   │   │   ├── sites.service.ts
│   │   │   └── sites.schema.ts
│   │   ├── collect/
│   │   │   ├── collect.routes.ts
│   │   │   ├── collect.service.ts
│   │   │   ├── collect.schema.ts
│   │   │   └── tracker/
│   │   │       └── tracker.ts    # Takip betiği kaynak kodu
│   │   ├── reports/
│   │   │   ├── reports.routes.ts
│   │   │   ├── overview.service.ts
│   │   │   ├── timeseries.service.ts
│   │   │   ├── pages.service.ts
│   │   │   ├── sources.service.ts
│   │   │   ├── geo.service.ts
│   │   │   ├── devices.service.ts
│   │   │   └── events.service.ts
│   │   ├── realtime/
│   │   │   ├── realtime.routes.ts
│   │   │   └── realtime.service.ts
│   │   └── export/
│   │       ├── export.routes.ts
│   │       └── export.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── site.model.ts
│   │   ├── event.model.ts
│   │   ├── session.model.ts
│   │   └── aggregate.model.ts
│   ├── workers/
│   │   ├── flush.worker.ts       # Redis → MongoDB flush
│   │   ├── aggregate.worker.ts   # Günlük toplulaştırma
│   │   └── cleanup.worker.ts     # Eski verileri temizleme
│   ├── shared/
│   │   ├── geoip.ts              # IP → coğrafi konum
│   │   ├── useragent.ts          # UA ayrıştırma
│   │   ├── bot-detector.ts       # Bot tespiti
│   │   ├── cache.ts              # Redis önbellek yardımcısı
│   │   └── logger.ts             # Yapılandırılmış loglama
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── bun.lockb
├── bunfig.toml
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 12. Ortam Değişkenleri

```env
# Uygulama
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smartanalytics

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=<32+ karakter>
JWT_REFRESH_SECRET=<32+ karakter>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# E-posta (SMTP)
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@smartanalytics.io

# GeoIP
MAXMIND_DB_PATH=./data/GeoLite2-City.mmdb

# Önbellek
REPORT_CACHE_TTL=300
REALTIME_UPDATE_INTERVAL=5000

# CDN
TRACKER_CDN_URL=https://cdn.smartanalytics.io
```

---

## 13. Worker ve Cron Görevleri

| Görev | Zamanlama | Açıklama |
|---|---|---|
| `flush.worker` | Her 5 sn (setInterval) | Redis buffer → MongoDB toplu yazma |
| `aggregate.worker` | Her gün 02:00 UTC | Önceki günün verilerini `daily_aggregates`'e yazar |
| `session.cleanup` | Her 5 dk | 30 dk+ aktif olan oturumları kapat |
| `realtime.cleanup` | Her 30 sn | Redis'teki eski aktif kullanıcıları temizle |
| `export.processor` | Sürekli (kuyruk) | Bekleyen export işlerini işle |

---

## 14. Test Gereksinimleri

| Tür | Araç | Kapsam Hedefi |
|---|---|---|
| Birim Testleri | Bun test runner | ≥ 80 % |
| Entegrasyon Testleri | Bun test + test MongoDB/Redis | Tüm API endpoint'leri |
| Yük Testi | k6 | 10.000 istek/sn senaryosu |
| Güvenlik Taraması | OWASP ZAP | CI/CD'de otomatik |

---

## 15. Dağıtım (Deployment)

### 15.1 Docker Compose (Geliştirme)

```yaml
version: '3.9'
services:
  api:
    build: .
    ports: ['3001:3001']
    environment:
      - NODE_ENV=development
    depends_on: [mongodb, redis]

  mongodb:
    image: mongo:7
    ports: ['27017:27017']
    volumes: ['mongo_data:/data/db']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    command: redis-server --appendonly yes

volumes:
  mongo_data:
```

### 15.2 Üretim Ortamı

- Yatay ölçekleme için stateless API node'ları  
- Redis Cluster veya Redis Sentinel  
- MongoDB Replica Set (3 node)  
- Nginx veya Caddy reverse proxy  
- Otomatik SSL (Let's Encrypt)  

---

## 16. Gelecek Sürümler

| Özellik | Hedef Sürüm |
|---|---|
| Google OAuth bağlantısı | v1.1 |
| Dönüşüm hunisi (Funnel) raporu | v1.1 |
| Webhook bildirimleri | v1.2 |
| Makine öğrenmesi anomali tespiti | v2.0 |
| Mobil SDK (iOS/Android) | v2.0 |
| ClickHouse'a geçiş (OLAP optimizasyonu) | v2.5 |

---

*Bu belge yaşayan bir dokümandır. Değişiklikler için PR açılmalı ve ekip lideri onayı alınmalıdır.*
