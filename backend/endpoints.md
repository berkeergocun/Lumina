# Lumina Analytics API — Endpoint Dokümantasyonu

> **Base URL:** `http://localhost:3001/api/v1`  
> **Swagger UI:** `http://localhost:3001/docs`  
> **Auth:** Bearer token (JWT) — `Authorization: Bearer <access_token>`

---

## İçindekiler

1. [Health Check](#1-health-check)
2. [Auth — Kimlik Doğrulama](#2-auth--kimlik-doğrulama)
3. [Sites — Site Yönetimi](#3-sites--site-yönetimi)
4. [Collect — Event Toplama](#4-collect--event-toplama)
5. [Reports — Raporlar](#5-reports--raporlar)
6. [Realtime — Canlı Veriler](#6-realtime--canlı-veriler)
7. [Export — Veri Dışa Aktarma](#7-export--veri-dışa-aktarma)
8. [Admin — Platform Yönetimi](#8-admin--platform-yönetimi)

---

## 1. Health Check

### `GET /health`

Sunucu durum kontrolü. Auth gerektirmez.

**Yanıt `200`:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "uptime": 3600.12
}
```

---

## 2. Auth — Kimlik Doğrulama

### `POST /api/v1/auth/register`

Yeni kullanıcı kaydı.

**İstek Gövdesi:**
```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "password": "Secur3P@ss!"
}
```

**Yanıt `201`:**
```json
{
  "success": true,
  "data": {
    "message": "Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.",
    "userId": "a1b2c3d4e5f6"
  }
}
```

**Hata `400`:** `EMAIL_EXISTS` — E-posta zaten kayıtlı.

---

### `POST /api/v1/auth/login`

Kullanıcı girişi. Access token (15 dk) ve refresh token (30 gün) döner.

**İstek Gövdesi:**
```json
{
  "email": "ahmet@example.com",
  "password": "Secur3P@ss!"
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "a1b2c3d4e5f6",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "role": "owner"
    }
  }
}
```

**Hata `401`:** `INVALID_CREDENTIALS`  
**Hata `401`:** `EMAIL_NOT_VERIFIED`

---

### `POST /api/v1/auth/refresh`

Access token'ı yenile (refresh token rotasyonu).

**İstek Gövdesi:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Hata `401`:** `INVALID_REFRESH_TOKEN`

---

### `POST /api/v1/auth/logout`

Oturumu kapat (refresh token geçersiz kıl). **Auth gerektirir.**

**İstek Gövdesi:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "Çıkış başarılı." }
}
```

---

### `POST /api/v1/auth/forgot-password`

Şifre sıfırlama e-postası gönder.

**İstek Gövdesi:**
```json
{
  "email": "ahmet@example.com"
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "Şifre sıfırlama e-postası gönderildi." }
}
```

---

### `POST /api/v1/auth/reset-password`

Şifreyi sıfırla.

**İstek Gövdesi:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecur3P@ss!"
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "Şifre başarıyla güncellendi." }
}
```

**Hata `400`:** `INVALID_TOKEN` / `TOKEN_EXPIRED`

---

### `POST /api/v1/auth/verify-email`

E-posta adresini doğrula.

**İstek Gövdesi:**
```json
{
  "token": "verify-token-from-email"
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "E-posta doğrulandı." }
}
```

---

## 3. Sites — Site Yönetimi

> Tüm endpoint'ler **Auth gerektirir.**

### `GET /api/v1/sites`

Kullanıcıya ait tüm siteleri listele.

**Yanıt `200`:**
```json
{
  "success": true,
  "data": [
    {
      "siteId": "s1a2b3c4d5e6",
      "name": "Benim Blogum",
      "domain": "blog.example.com",
      "timezone": "Europe/Istanbul",
      "isVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1 }
}
```

---

### `POST /api/v1/sites`

Yeni site ekle.

**İstek Gövdesi:**
```json
{
  "name": "Benim Blogum",
  "domain": "blog.example.com",
  "timezone": "Europe/Istanbul"
}
```

**Yanıt `201`:**
```json
{
  "success": true,
  "data": {
    "siteId": "s1a2b3c4d5e6",
    "name": "Benim Blogum",
    "domain": "blog.example.com",
    "timezone": "Europe/Istanbul",
    "isVerified": false,
    "verificationToken": "sa-verify-abc123"
  }
}
```

---

### `GET /api/v1/sites/:siteId`

Belirli bir siteyi getir.

**URL Parametresi:** `:siteId`

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "siteId": "s1a2b3c4d5e6",
    "name": "Benim Blogum",
    "domain": "blog.example.com",
    "timezone": "Europe/Istanbul",
    "isVerified": true,
    "publicStats": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### `PUT /api/v1/sites/:siteId`

Site bilgilerini güncelle.

**İstek Gövdesi (kısmi güncelleme):**
```json
{
  "name": "Yeni Blog Adı",
  "publicStats": true,
  "excludeIPs": ["192.168.1.1"]
}
```

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "Site güncellendi." }
}
```

---

### `DELETE /api/v1/sites/:siteId`

Siteyi sil (soft-delete).

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "Site silindi." }
}
```

---

### `POST /api/v1/sites/:siteId/verify`

Site sahipliğini doğrula (DNS TXT veya HTML meta tag).

**İstek Gövdesi:**
```json
{
  "method": "dns"
}
```

`method`: `"dns"` | `"meta"`

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "isVerified": true, "message": "Site doğrulandı." }
}
```

---

### `GET /api/v1/sites/:siteId/snippet`

Tracking snippet kodunu getir (HTML ve JS).

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "html": "<script async src=\"http://localhost:3001/api/v1/collect/tracker.js\" data-site-id=\"s1a2b3c4d5e6\"></script>",
    "js": "window.Lumina={siteId:'s1a2b3c4d5e6'}",
    "siteId": "s1a2b3c4d5e6",
    "verificationToken": "sa-verify-abc123"
  }
}
```

---

## 4. Collect — Event Toplama

### `POST /api/v1/collect`

Tracker'dan event gönder. Auth gerektirmez (herkese açık).

**Headers:**
```
Origin: https://blog.example.com
Content-Type: application/json
```

**İstek Gövdesi:**
```json
{
  "siteId": "s1a2b3c4d5e6",
  "type": "pageview",
  "url": "https://blog.example.com/post/123",
  "referrer": "https://google.com",
  "sessionId": "sess_abc123",
  "visitorId": "vis_xyz789",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "spring-sale",
    "term": "analytics",
    "content": "banner-a"
  },
  "screen": {
    "width": 1920,
    "height": 1080
  },
  "duration": 0,
  "isEntry": true,
  "isBounce": false
}
```

`type`: `"pageview"` | `"custom"` | `"click"` | `"form_submit"` | `"download"`

**Yanıt `202`:**
```json
{
  "success": true,
  "data": { "message": "Event alındı." }
}
```

**Hata `429`:** Rate limit aşıldı (20 istek / 5 sn)  
**Hata `403`:** Geçersiz `siteId` veya domain izin verilmemiş

---

### `OPTIONS /api/v1/collect`

CORS preflight. Headers döner, body yok.

---

### `GET /api/v1/collect/ping`

1×1 transparan GIF piksel. CSS/JS engelleyicilerden korunmak için.

**Query Parametreleri:**

| Parametre  | Zorunlu | Açıklama                    |
|------------|---------|------------------------------|
| `sid`      | Evet    | Site ID                      |
| `url`      | Evet    | Sayfa URL                    |
| `ref`      | Hayır   | Referrer                     |
| `uid`      | Hayır   | Visitor ID                   |
| `sess`     | Hayır   | Session ID                   |

**Yanıt:** `200` `image/gif` (1×1 GIF binary)

---

### `GET /api/v1/collect/tracker.js`

Minified tracking script dosyası.

**Yanıt:** `200` `application/javascript`

Kullanım:
```html
<script async 
  src="https://analytics.example.com/api/v1/collect/tracker.js"
  data-site-id="s1a2b3c4d5e6">
</script>
```

Manuel event:
```javascript
window.Lumina.track('button_click', { button: 'signup' });
```

---

## 5. Reports — Raporlar

> Tüm endpoint'ler **Auth gerektirir.**

### Ortak Query Parametreleri

| Parametre  | Zorunlu | Açıklama                                          |
|------------|---------|---------------------------------------------------|
| `siteId`   | Evet    | Site ID                                           |
| `from`     | Hayır   | Başlangıç tarihi `YYYY-MM-DD` (varsayılan: -30g) |
| `to`       | Hayır   | Bitiş tarihi `YYYY-MM-DD` (varsayılan: bugün)    |
| `timezone` | Hayır   | IANA timezone (varsayılan: `UTC`)                 |

---

### `GET /api/v1/reports/overview`

Genel özet istatistikler.

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "pageviews": 12540,
    "uniqueVisitors": 4320,
    "sessions": 5890,
    "bounceRate": 0.42,
    "avgSessionDuration": 187.5,
    "pagesPerSession": 2.13,
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    }
  }
}
```

---

### `GET /api/v1/reports/timeseries`

Zaman serisi — günlük/saatlik grafik verisi.

**Ek Query Parametreleri:**

| Parametre   | Açıklama                                          |
|-------------|---------------------------------------------------|
| `granularity` | `hour` \| `day` \| `week` \| `month` (varsayılan: `day`) |

**Yanıt `200`:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-15",
      "pageviews": 420,
      "visitors": 185,
      "sessions": 210
    }
  ]
}
```

---

### `GET /api/v1/reports/pages`

En çok ziyaret edilen sayfalar.

**Ek Query Parametreleri:**

| Parametre | Açıklama                               |
|-----------|----------------------------------------|
| `page`    | Sayfa no (varsayılan: 1)               |
| `limit`   | Sonuç sayısı (varsayılan: 20, max: 100)|

**Yanıt `200`:**
```json
{
  "success": true,
  "data": [
    {
      "url": "/blog/post-123",
      "pageviews": 1240,
      "visitors": 890,
      "bounceRate": 0.38,
      "avgTimeOnPage": 145.2
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 87 }
}
```

---

### `GET /api/v1/reports/sources`

Trafik kaynakları (UTM, referrer).

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "sources": [
      { "source": "google", "visitors": 1540, "pageviews": 2310, "bounceRate": 0.45 },
      { "source": "direct", "visitors": 980, "pageviews": 1450, "bounceRate": 0.31 }
    ],
    "mediums": [
      { "medium": "organic", "visitors": 1540, "pageviews": 2310 }
    ],
    "campaigns": [],
    "referrers": [
      { "referrer": "twitter.com", "visitors": 320, "pageviews": 480 }
    ]
  }
}
```

---

### `GET /api/v1/reports/geo`

Coğrafi dağılım.

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "countries": [
      { "country": "TR", "countryName": "Turkey", "visitors": 2100, "pageviews": 3200 },
      { "country": "US", "countryName": "United States", "visitors": 890, "pageviews": 1300 }
    ],
    "cities": [
      { "city": "Istanbul", "country": "TR", "visitors": 1200, "pageviews": 1850 }
    ]
  }
}
```

---

### `GET /api/v1/reports/devices`

Cihaz, tarayıcı ve işletim sistemi dağılımı.

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "deviceTypes": [
      { "device": "desktop", "visitors": 2400, "percentage": 0.62 },
      { "device": "mobile", "visitors": 1350, "percentage": 0.35 },
      { "device": "tablet", "visitors": 120, "percentage": 0.03 }
    ],
    "browsers": [
      { "browser": "Chrome", "visitors": 2100, "percentage": 0.54 },
      { "browser": "Safari", "visitors": 980, "percentage": 0.25 }
    ],
    "operatingSystems": [
      { "os": "Windows", "visitors": 1800, "percentage": 0.46 },
      { "os": "macOS", "visitors": 650, "percentage": 0.17 }
    ],
    "screenResolutions": [
      { "resolution": "1920x1080", "visitors": 540, "percentage": 0.14 }
    ]
  }
}
```

---

### `GET /api/v1/reports/events`

Özel event listesi.

**Ek Query Parametreleri:**

| Parametre    | Açıklama                               |
|--------------|----------------------------------------|
| `eventName`  | Event adı filtresi                     |
| `page`       | Sayfa no (varsayılan: 1)               |
| `limit`      | Sonuç sayısı (varsayılan: 20, max: 100)|

**Yanıt `200`:**
```json
{
  "success": true,
  "data": [
    {
      "name": "button_click",
      "count": 340,
      "uniqueVisitors": 280,
      "lastSeen": "2025-01-15T09:42:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12 }
}
```

---

### `GET /api/v1/reports/events/:eventName/properties`

Belirli bir event'ın özellik dağılımı.

**URL Parametresi:** `:eventName`

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "eventName": "button_click",
    "properties": {
      "button": [
        { "value": "signup", "count": 180, "percentage": 0.53 },
        { "value": "login", "count": 160, "percentage": 0.47 }
      ]
    }
  }
}
```

---

## 6. Realtime — Canlı Veriler

> Auth gerektirir.

### `GET /api/v1/realtime/stream`

Server-Sent Events (SSE) akışı. Her 5 saniyede veri gönderir.

**Query Parametresi:** `siteId` (zorunlu)

**Headers (istemci):**
```
Accept: text/event-stream
Authorization: Bearer <token>
```

**SSE Mesaj Formatı:**
```
data: {"activeVisitors":42,"activePages":[{"url":"/anasayfa","count":18},{"url":"/blog","count":12}],"recentEvents":[{"type":"pageview","url":"/urunler","timestamp":"2025-01-15T10:05:00.000Z"}],"timestamp":"2025-01-15T10:05:00.000Z"}

```

**JavaScript Örneği:**
```javascript
const es = new EventSource(
  '/api/v1/realtime/stream?siteId=s1a2b3c4d5e6',
  { headers: { 'Authorization': 'Bearer ...' } }
);
es.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

### `GET /api/v1/realtime/snapshot`

Anlık canlı veri (tek seferlik, SSE değil).

**Query Parametresi:** `siteId` (zorunlu)

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "activeVisitors": 42,
    "activePages": [
      { "url": "/anasayfa", "count": 18 },
      { "url": "/blog", "count": 12 }
    ],
    "recentEvents": [
      {
        "type": "pageview",
        "url": "/urunler",
        "country": "TR",
        "device": "mobile",
        "timestamp": "2025-01-15T10:05:00.000Z"
      }
    ],
    "timestamp": "2025-01-15T10:05:00.000Z"
  }
}
```

---

## 7. Export — Veri Dışa Aktarma

> Auth gerektirir.

### `POST /api/v1/export`

Yeni export işi başlat (asenkron).

**İstek Gövdesi:**
```json
{
  "siteId": "s1a2b3c4d5e6",
  "type": "events",
  "format": "csv",
  "from": "2025-01-01",
  "to": "2025-01-31"
}
```

| Alan     | Değerler                                          |
|----------|---------------------------------------------------|
| `type`   | `"events"` \| `"sessions"` \| `"pages"` \| `"sources"` |
| `format` | `"csv"` \| `"json"`                              |

**Yanıt `202`:**
```json
{
  "success": true,
  "data": {
    "jobId": "export_abc123_1705312800000",
    "message": "Export işi başlatıldı.",
    "statusUrl": "/api/v1/export/export_abc123_1705312800000/status"
  }
}
```

---

### `GET /api/v1/export/:jobId/status`

Export iş durumu sorgula.

**URL Parametresi:** `:jobId`

**Yanıt — İşleniyor `200`:**
```json
{
  "success": true,
  "data": {
    "jobId": "export_abc123_1705312800000",
    "status": "processing",
    "progress": 45,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Yanıt — Tamamlandı `200`:**
```json
{
  "success": true,
  "data": {
    "jobId": "export_abc123_1705312800000",
    "status": "completed",
    "progress": 100,
    "downloadUrl": "data:text/csv;base64,dGVzdA==",
    "rowCount": 12540,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "completedAt": "2025-01-15T10:00:45.000Z"
  }
}
```

**Yanıt — Hata `200`:**
```json
{
  "success": true,
  "data": {
    "jobId": "export_abc123_1705312800000",
    "status": "failed",
    "error": "Veri çekme sırasında hata oluştu."
  }
}
```

**Status değerleri:** `pending` | `processing` | `completed` | `failed`

---

## 8. Admin — Platform Yönetimi

> Auth gerektirir. Yalnızca `role: "owner"` kullanıcılar erişebilir.

### `GET /api/v1/admin/users`

Tüm kayıtlı kullanıcıları listele.

**Yanıt `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4e5f6",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "role": "owner",
      "isVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1 }
}
```

---

### `DELETE /api/v1/admin/users/:userId`

Kullanıcıyı kalıcı olarak sil.

**URL Parametresi:** `:userId` (MongoDB ObjectId)

**Yanıt `200`:**
```json
{
  "success": true,
  "data": { "message": "Kullanıcı silindi." }
}
```

**Hata `404`:** `USER_NOT_FOUND`

---

### `GET /api/v1/admin/stats`

Platform geneli istatistikler.

**Yanıt `200`:**
```json
{
  "success": true,
  "data": {
    "users": 48,
    "sites": 127,
    "events": 8420000,
    "sessions": 1250000,
    "timestamp": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## Hata Yanıt Formatı

Tüm hata yanıtları aşağıdaki formattadır:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata açıklaması."
  }
}
```

### Genel Hata Kodları

| HTTP | Kod                    | Açıklama                          |
|------|------------------------|-----------------------------------|
| 400  | `VALIDATION_ERROR`     | İstek gövdesi doğrulama hatası    |
| 401  | `UNAUTHORIZED`         | Token eksik veya geçersiz         |
| 401  | `INVALID_CREDENTIALS`  | Yanlış e-posta / şifre            |
| 401  | `TOKEN_EXPIRED`        | Token süresi dolmuş               |
| 403  | `FORBIDDEN`            | Yetersiz yetki                    |
| 404  | `NOT_FOUND`            | Kaynak bulunamadı                 |
| 429  | `RATE_LIMIT_EXCEEDED`  | İstek limiti aşıldı (20/5sn)     |
| 500  | `INTERNAL_ERROR`       | Sunucu hatası                     |

---

## Rate Limiting

Collect endpoint'i IP bazlı rate limit uygular:

- **Limit:** 20 istek / 5 saniye (per IP)
- **Hata:** `429 Too Many Requests`
- **Header:** `Retry-After: 5`

---

## CORS

Collect endpoint'i (`/api/v1/collect`) CORS header gönderir.  
İzin verilen origin'ler `CORS_ORIGINS` ortam değişkeniyle yapılandırılır.

```
Access-Control-Allow-Origin: https://blog.example.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
