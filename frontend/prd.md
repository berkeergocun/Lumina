# Lumina Analytics — Frontend PRD (Product Requirements Document)

**Versiyon:** 1.0.0  
**Tarih:** 28 Şubat 2026  
**Durum:** Taslak  
**Sorumlu Ekip:** Frontend / UI  

---

## 1. Ürün Özeti

Lumina Frontend; web analitik verilerini anlaşılır grafikler, tablolar ve gerçek zamanlı sayaçlarla sunan, Nuxt 4 ve Shadcn UI üzerine inşa edilmiş bir SaaS dashboard'udur. Kullanıcılar bu arayüz üzerinden web sitelerini yönetebilir, raporları inceleyebilir, özel etkinlikleri izleyebilir ve verilerini dışa aktarabilir.

**Teknoloji Yığını:**

| Katman | Teknoloji |
|---|---|
| Framework | Nuxt 4 (Vue 3, Composition API) |
| UI Kit | Shadcn-Vue (Radix Vue tabanlı) |
| Stil | Tailwind CSS v4 |
| State Yönetimi | Pinia |
| Veri Çekme | Nuxt `useFetch` / `$fetch` (ofetch) |
| Gerçek Zamanlı | Yerleşik `EventSource` (SSE) |
| Grafik | Recharts (Vue wrapper) veya Chart.js (vue-chartjs) |
| Harita | Leaflet.js (ülke bazlı ısı haritası) |
| Form Doğrulama | VeeValidate + Zod |
| i18n | Nuxt i18n (TR / EN) |
| Test | Vitest + Vue Testing Library + Playwright |
| Tip Güvenliği | TypeScript (strict mode) |
| Paket Yöneticisi | Bun |

---

## 2. Hedefler ve Başarı Kriterleri

### 2.1 Kullanıcı Deneyimi Hedefleri

- Karmaşık analitik verilerini 3 tıklama veya daha azı ile ulaşılabilir kılmak.  
- Yeni kullanıcının ilk dashboard'a ulaşma süresi ≤ 3 dakika.  
- Mobil uyumlu (responsive) tasarım: 320px → 2560px arası tüm genişlikler.  

### 2.2 Başarı Kriterleri (KPI)

| Metrik | Hedef |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5 sn |
| Cumulative Layout Shift (CLS) | < 0.1 |
| First Input Delay (FID) | < 100 ms |
| Time to Interactive (TTI) | < 3.5 sn |
| Lighthouse Performans Skoru | ≥ 90 |
| Accessibility Skoru (WCAG 2.1 AA) | ≥ 90 |

---

## 3. Kullanıcı Profilleri

| Rol | Dashboard Yetkileri |
|---|---|
| **Admin (Site Sahibi)** | Tüm sayfalar, site yönetimi, üye daveti, ayarlar |
| **Analist (Viewer)** | Raporlar ve gerçek zamanlı sayfa; yazma işlemi yok |
| **Misafir (unauthenticated)** | Yalnızca giriş / kayıt sayfaları |

---

## 4. Kapsam Dışı (Out of Scope) — v1.0

- Yerleşik e-posta kampanya yönetimi  
- Reklam hesabı entegrasyon UI'ı  
- Mobil uygulama (native iOS/Android)  
- Makine öğrenmesi öneri widget'ları (v2)  

---

## 5. Sayfa ve Özellik Envanteri

### 5.1 Genel Sayfa Listesi

```
/                          → Pazarlama ana sayfası (landing)
/login                     → Giriş
/register                  → Kayıt
/forgot-password           → Şifre sıfırlama isteği
/reset-password            → Şifre sıfırlama formu
/verify-email              → E-posta doğrulama

/dashboard                 → Site seçim + genel bakış
/dashboard/:siteId         → Seçili site genel bakış
/dashboard/:siteId/realtime         → Gerçek zamanlı izleme
/dashboard/:siteId/pages            → Sayfa analitiği
/dashboard/:siteId/sources          → Trafik kaynakları
/dashboard/:siteId/geo              → Coğrafi dağılım
/dashboard/:siteId/devices          → Cihaz ve tarayıcı
/dashboard/:siteId/events           → Özel etkinlikler
/dashboard/:siteId/export           → Veri dışa aktarma

/sites                     → Site listesi
/sites/new                 → Yeni site ekle
/sites/:siteId/settings    → Site ayarları (domain, timezone vs.)
/sites/:siteId/snippet     → Takip kodu entegrasyon sayfası

/settings                  → Kullanıcı hesap ayarları
/settings/profile          → Profil düzenleme
/settings/security         → Şifre değiştirme, 2FA
/settings/billing          → Fatura (v1.1)

/admin                     → Süper admin paneli (role: superadmin)
```

---

## 6. Fonksiyonel Gereksinimler

### 6.1 Kimlik Doğrulama Akışları

| ID | Gereksinim |
|---|---|
| FE-AUTH-01 | Kayıt formunda e-posta, şifre (≥8 karakter, büyük/küçük harf + rakam), ad alanları olmalı |
| FE-AUTH-02 | Giriş sonrası Access Token HTTP-only cookie'de saklanmalı, Refresh Token ayrı cookie'de |
| FE-AUTH-03 | Otomatik token yenileme: API 401 dönünce `/auth/refresh` çağrılmalı, başarısızsa login'e yönlendir |
| FE-AUTH-04 | "Beni hatırla" seçeneği: check işaretliyse oturum kalıcı, değilse session bazlı |
| FE-AUTH-05 | Şifre sıfırlama: e-posta girişi → link gönderildi bildirimi → yeni şifre formu |
| FE-AUTH-06 | E-posta doğrulama banner'ı: doğrulanmamış hesaplarda her sayfada gösterilmeli |
| FE-AUTH-07 | Giriş/kayıt sayfasında klavye odak yönetimi (WCAG 2.1 AA) sağlanmalı |

### 6.2 Genel Bakış (Overview) Dashboard'u

| ID | Gereksinim |
|---|---|
| FE-OVW-01 | Üst kısımda tarih aralığı seçici olmalı: Bugün / Dün / Son 7 gün / Son 30 gün / Son 3 ay / Özel |
| FE-OVW-02 | 6 temel metrik kartı: Benzersiz Ziyaretçi, Sayfa Görüntüleme, Oturum, Ortalama Süre, Bounce Rate, Yeni / Geri Dönen |
| FE-OVW-03 | Her metrik kartında önceki dönemle karşılaştırma (% fark, renk kodlu ok) gösterilmeli |
| FE-OVW-04 | Zaman serisi çizgi grafiği: seçilen tarih aralığına göre sayfa görüntüleme ve ziyaretçi |
| FE-OVW-05 | Grafik altında granülarite slider'ı: Saat / Gün / Hafta / Ay |
| FE-OVW-06 | En çok gösterilen 5 sayfa mini tablosu |
| FE-OVW-07 | Trafik kaynağı pasta grafiği (Doğrudan, Organik, Sosyal, Referral, E-posta) |
| FE-OVW-08 | Cihaz dağılımı (Masaüstü / Mobil / Tablet) donut grafiği |

### 6.3 Gerçek Zamanlı (Realtime) Sayfası

| ID | Gereksinim |
|---|---|
| FE-RT-01 | "Şu an X kullanıcı aktif" büyük sayaç —5 saniyede bir SSE ile güncellenmeli |
| FE-RT-02 | Aktif sayfalar listesi: URL, anlık ziyaretçi sayısı |
| FE-RT-03 | Son 30 dakikanın mini zaman serisi barı (her bar = 1 dk) |
| FE-RT-04 | Anlık coğrafi dağılım: ülke bayrakları + sayı listesi |
| FE-RT-05 | Bağlantı kaybında otomatik yeniden bağlanma (exponential backoff) |
| FE-RT-06 | "Canlı" göstergesi (yeşil yanıp sönen nokta) |

### 6.4 Sayfa Analizi

| ID | Gereksinim |
|---|---|
| FE-PG-01 | Sayfalandırılmış tablo: URL, Görüntülenme, Benzersiz Gz., Giriş Sayfası, Çıkış Sayfası, Bounce Rate |
| FE-PG-02 | URL sütununda arama/filtreleme |
| FE-PG-03 | Başlık veya URL'ye göre sıralama |
| FE-PG-04 | Satıra tıklayınca sayfa detayı modal'ı açılmalı (zaman serisi, cihaz dağılımı) |
| FE-PG-05 | CSV / JSON'a aktarma butonu |

### 6.5 Trafik Kaynakları

| ID | Gereksinim |
|---|---|
| FE-SRC-01 | Kaynak türüne göre sekme geçişi: Tümü / Doğrudan / Arama / Sosyal / Referral / E-posta / UTM |
| FE-SRC-02 | UTM kampanya tablosu: Source, Medium, Campaign, Term, Content, Oturum, Dönüşüm |
| FE-SRC-03 | Referrer domain listesi, dışa tıklanabilir (yeni sekmede aç) |
| FE-SRC-04 | Sosyal medya platformu ikonları otomatik tanınmalı |

### 6.6 Coğrafi Dağılım

| ID | Gereksinim |
|---|---|
| FE-GEO-01 | Dünya haritası (Leaflet): ülke bazlı renk yoğunluğu (choropleth) |
| FE-GEO-02 | Harita yanında ülke tablosu: Bayrak, Ülke Adı, Oturum, % Oran |
| FE-GEO-03 | Ülkeye tıklayınca şehir bazlı detay açılmalı |
| FE-GEO-04 | Harita zoom ve pan desteklemeli |

### 6.7 Cihaz ve Tarayıcı Analizi

| ID | Gereksinim |
|---|---|
| FE-DEV-01 | Cihaz tipi (Masaüstü/Mobil/Tablet) ve Tarayıcı ve OS için ayrı pasta/bar grafikler |
| FE-DEV-02 | Ekran çözünürlüğü dağılımı tablosu |
| FE-DEV-03 | Tarayıcı logoları otomatik gösterilmeli |

### 6.8 Özel Etkinlikler (Custom Events)

| ID | Gereksinim |
|---|---|
| FE-EVT-01 | Etkinlik adı bazlı liste: Tetiklenme Sayısı, Benzersiz Kullanıcı, İlk / Son Tetiklenme |
| FE-EVT-02 | Etkinliğe tıklayınca özellik (property) değerlerinin dağılımı gösterilmeli |
| FE-EVT-03 | Etkinlik adı bazında zaman serisi grafiği |
| FE-EVT-04 | Property değerleri için arama/filtreleme |

### 6.9 Site Yönetimi

| ID | Gereksinim |
|---|---|
| FE-SITE-01 | Site ekleme sihirbazı (wizard): Alan adı → Doğrulama → Betik Alma (3 adım) |
| FE-SITE-02 | Doğrulama yöntemi seçimi: DNS TXT kaydı veya HTML meta etiketi |
| FE-SITE-03 | "Doğrulamayı Kontrol Et" butonu ile anlık doğrulama durumu |
| FE-SITE-04 | Kod snippet'ı kopyalama butonu + Syntax highlighting |
| FE-SITE-05 | NPM, CDN, WordPress ve Webflow için ayrı entegrasyon talimatları |
| FE-SITE-06 | Site silme işlemi onay dialog'u olmalı |

### 6.10 Veri Dışa Aktarma

| ID | Gereksinim |
|---|---|
| FE-EXP-01 | Rapor türü seçimi (Sayfalar, Kaynaklar, Etkinlikler vb.) |
| FE-EXP-02 | Tarih aralığı ve format seçimi (CSV / JSON) |
| FE-EXP-03 | Büyük exportlarda ilerleme göstergesi (progress bar / spinner) |
| FE-EXP-04 | Export hazır olduğunda bildirim (toast) ve otomatik indirme |

### 6.11 Hesap Ayarları

| ID | Gereksinim |
|---|---|
| FE-SET-01 | Profil formu: Ad, e-posta, avatar (URL veya dosya yükleme) |
| FE-SET-02 | Şifre değiştirme: mevcut şifre + yeni şifre + onay |
| FE-SET-03 | 2FA ayarı: TOTP (Google Authenticator uyumlu) QR kodu ile kurulum |
| FE-SET-04 | Oturum listesi: aktif cihazlar, son erişim ve uzaktan sonlandırma |
| FE-SET-05 | Hesabı silme: onay dialog'u + şifre doğrulama |

---

## 7. Tasarım Sistemi

### 7.1 Renk Paleti

| Token | Açık Mod | Koyu Mod |
|---|---|---|
| `--background` | `#FFFFFF` | `#09090B` |
| `--foreground` | `#09090B` | `#FAFAFA` |
| `--primary` | `#6366F1` (Indigo 500) | `#818CF8` (Indigo 400) |
| `--primary-foreground` | `#FFFFFF` | `#09090B` |
| `--muted` | `#F4F4F5` | `#27272A` |
| `--muted-foreground` | `#71717A` | `#A1A1AA` |
| `--card` | `#FFFFFF` | `#18181B` |
| `--border` | `#E4E4E7` | `#27272A` |
| `--success` | `#22C55E` | `#4ADE80` |
| `--destructive` | `#EF4444` | `#F87171` |
| `--warning` | `#F59E0B` | `#FCD34D` |

### 7.2 Tipografi

| Kullanım | Font | Ağırlık | Boyut |
|---|---|---|---|
| Başlık (H1) | Inter | 700 | 2rem |
| Başlık (H2) | Inter | 600 | 1.5rem |
| Gövde | Inter | 400 | 0.875rem |
| Kod / Snippet | JetBrains Mono | 400 | 0.8rem |
| Metrik Sayacı | Inter | 800 | 2.25rem |

### 7.3 Shadcn Bileşen Listesi (Kullanılacaklar)

```
Button, Input, Textarea, Select, Checkbox, Switch, RadioGroup
Card, Badge, Avatar, Separator, Skeleton
Dialog, Sheet, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu
Table, DataTable (TanStack Table entegrasyonu)
Tabs, Accordion, Collapsible
Progress, Spinner (özel)
Toast (Sonner)
Calendar, DateRangePicker (özel)
Command (arama paleti — ⌘K)
NavigationMenu, Breadcrumb, Sidebar
AlertDialog, Alert
Form (VeeValidate entegrasyonu)
```

### 7.4 Koyu / Açık Tema

- Kullanıcı tercihi `localStorage`'da saklanmalı.  
- Sistem tercihi (`prefers-color-scheme`) otomatik uygulanmalı.  
- Tema değişimi anlık olmalı (FOUC olmadan).  

---

## 8. Düzen (Layout) Mimarisi

### 8.1 Authenticated Layout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px, daraltılabilir 64px)               │
│  ┌──────────────────────────────────────────────┐   │
│  │ Logo | Site Seçici ▼                         │   │
│  │──────────────────────────────────────────────│   │
│  │ ≡ Genel Bakış                                │   │
│  │ ⚡ Gerçek Zamanlı                            │   │
│  │ 📄 Sayfalar                                  │   │
│  │ 🔀 Kaynaklar                                 │   │
│  │ 🌍 Coğrafi Dağılım                           │   │
│  │ 💻 Cihazlar                                  │   │
│  │ ✨ Etkinlikler                                │   │
│  │──────────────────────────────────────────────│   │
│  │ ⚙ Ayarlar                                   │   │
│  │ 👤 Profil                                    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Header: Breadcrumb | Tarih Seçici | Arama    │   │
│  │──────────────────────────────────────────────│   │
│  │                                              │   │
│  │              Sayfa İçeriği                   │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 8.2 Responsive Davranış

| Breakpoint | Sidebar | Layout |
|---|---|---|
| `< 768px (mobile)` | Alt navigasyon çubuğu | Tek sütun |
| `768px–1024px (tablet)` | İkon modunda daraltılmış | 2 sütun grid |
| `≥ 1024px (desktop)` | Tam genişlik sidebar | Çok sütunlu grid |

---

## 9. State Yönetimi (Pinia Stores)

```
stores/
├── auth.store.ts         # Kullanıcı, oturum, token
├── site.store.ts         # Aktif site, site listesi
├── report.store.ts       # Rapor verileri, filtreler, yükleme durumu
├── realtime.store.ts     # SSE bağlantısı, anlık veriler
├── ui.store.ts           # Tema, sidebar durumu, modal açık/kapalı
└── notification.store.ts # Toast bildirimleri
```

### Rapor Store Filtreler

```ts
interface ReportFilters {
  siteId: string
  from: Date
  to: Date
  granularity: 'hour' | 'day' | 'week' | 'month'
  compareWith?: 'previous_period' | 'previous_year'
  page?: number
  limit?: number
}
```

---

## 10. API Entegrasyonu

### 10.1 Yapılandırma

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1'
    }
  }
})
```

### 10.2 Composable Katmanı

```
composables/
├── useAuth.ts            # login, logout, register, refresh
├── useSites.ts           # getSites, createSite, deleteSite
├── useOverview.ts        # fetchOverview
├── useTimeseries.ts      # fetchTimeseries
├── usePages.ts           # fetchPages
├── useSources.ts         # fetchSources
├── useGeo.ts             # fetchGeo
├── useDevices.ts         # fetchDevices
├── useEvents.ts          # fetchEvents
├── useRealtime.ts        # SSE bağlantı yönetimi
└── useExport.ts          # exportData, pollJobStatus
```

### 10.3 Hata Yönetimi

- Tüm API hataları merkezi `useApiError` composable'ı üzerinden işlenmeli.  
- 401: otomatik token yenile veya login'e yönlendir.  
- 429: "Çok fazla istek" toast + geri sayım göstergesi.  
- 5xx: "Sunucu hatası" toast + retry butonu.  
- Network timeout: offline banner göster.  

---

## 11. Dosya ve Proje Yapısı

```
frontend/
├── app/
│   ├── app.vue                   # Root bileşen
│   ├── pages/
│   │   ├── index.vue             # Landing sayfası
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── forgot-password.vue
│   │   ├── reset-password.vue
│   │   ├── verify-email.vue
│   │   ├── dashboard/
│   │   │   ├── index.vue         # Site seçim ekranı
│   │   │   └── [siteId]/
│   │   │       ├── index.vue     # Genel bakış
│   │   │       ├── realtime.vue
│   │   │       ├── pages.vue
│   │   │       ├── sources.vue
│   │   │       ├── geo.vue
│   │   │       ├── devices.vue
│   │   │       ├── events.vue
│   │   │       └── export.vue
│   │   ├── sites/
│   │   │   ├── index.vue
│   │   │   ├── new.vue
│   │   │   └── [siteId]/
│   │   │       ├── settings.vue
│   │   │       └── snippet.vue
│   │   ├── settings/
│   │   │   ├── profile.vue
│   │   │   ├── security.vue
│   │   │   └── billing.vue
│   │   └── admin/
│   │       └── index.vue
│   ├── layouts/
│   │   ├── default.vue           # Authenticated: sidebar + header
│   │   ├── auth.vue              # Login/register: ortalanmış kart
│   │   └── landing.vue           # Pazarlama sayfası
│   ├── components/
│   │   ├── ui/                   # Shadcn bileşenleri (otomatik üretilir)
│   │   ├── charts/
│   │   │   ├── LineChart.vue
│   │   │   ├── BarChart.vue
│   │   │   ├── PieChart.vue
│   │   │   ├── DonutChart.vue
│   │   │   └── MiniSparkline.vue
│   │   ├── dashboard/
│   │   │   ├── MetricCard.vue
│   │   │   ├── DateRangePicker.vue
│   │   │   ├── GranularitySelector.vue
│   │   │   └── CompareToggle.vue
│   │   ├── realtime/
│   │   │   ├── ActiveCounter.vue
│   │   │   ├── ActivePages.vue
│   │   │   └── MinuteBar.vue
│   │   ├── geo/
│   │   │   ├── WorldMap.vue
│   │   │   └── CountryTable.vue
│   │   ├── sites/
│   │   │   ├── SiteCard.vue
│   │   │   ├── AddSiteWizard.vue
│   │   │   ├── VerificationStep.vue
│   │   │   └── SnippetViewer.vue
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue
│   │   │   ├── AppHeader.vue
│   │   │   ├── SiteSelector.vue
│   │   │   ├── CommandPalette.vue
│   │   │   └── ThemeToggle.vue
│   │   └── shared/
│   │       ├── DataTable.vue
│   │       ├── EmptyState.vue
│   │       ├── ErrorBoundary.vue
│   │       ├── LoadingSkeleton.vue
│   │       └── OfflineBanner.vue
│   ├── composables/          # (yukarıda listelenmiş)
│   ├── stores/               # Pinia store'ları
│   ├── middleware/
│   │   ├── auth.ts           # Oturum kontrolü
│   │   └── guest.ts          # Giriş yapılmışsa dashboard'a yönlendir
│   ├── plugins/
│   │   ├── api.ts            # $fetch interceptor'ları
│   │   └── leaflet.client.ts # SSR'siz Leaflet kurulumu
│   └── utils/
│       ├── formatters.ts     # Sayı, tarih, yüzde formatlama
│       ├── colors.ts         # Grafik renk paleti
│       └── constants.ts
├── public/
│   └── favicon.svg
├── i18n/
│   ├── tr.json
│   └── en.json
├── tests/
│   ├── unit/
│   │   └── components/
│   └── e2e/
│       └── dashboard.spec.ts
├── .env.example
├── bun.lockb
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 12. Ortam Değişkenleri

```env
# API
NUXT_PUBLIC_API_BASE=http://localhost:3001/api/v1

# SSE
NUXT_PUBLIC_SSE_BASE=http://localhost:3001/api/v1

# Uygulama
NUXT_PUBLIC_APP_NAME=Lumina
NUXT_PUBLIC_APP_URL=http://localhost:3000

# i18n
NUXT_PUBLIC_DEFAULT_LOCALE=tr

# Özellik Bayrakları (Feature Flags)
NUXT_PUBLIC_FF_BILLING=false
NUXT_PUBLIC_FF_2FA=true
```

---

## 13. Performans Stratejisi

| Strateji | Uygulama |
|---|---|
| SSR | Tüm rapor sayfaları sunucu tarafında render (SEO + ilk yükleme) |
| ISR (Nuxt Hybrid) | Landing sayfası 1 saat cache |
| Code Splitting | Her route için otomatik chunk |
| Lazy Loading | Leaflet haritası ve ağır grafikler `defineAsyncComponent` ile |
| Image Optimizasyon | `<NuxtImg>` + WebP dönüşümü |
| Font Optimizasyon | `@nuxt/fonts` ile Google Fonts preload |
| Prefetch | Dashboard linkleri hover'da prefetch |
| Skeleton UI | Veri beklenirken içerik şekلي iskeleton göster |
| Virtual Scroll | 1000+ satırlı tablolarda `@tanstack/vue-virtual` |

---

## 14. Erişilebilirlik (Accessibility)

| ID | Gereksinim |
|---|---|
| A11Y-01 | Tüm interaktif bileşenler klavye ile kullanılabilmeli (Tab, Enter, Space, Escape) |
| A11Y-02 | Renk kontrastı WCAG AA standardını karşılamalı (≥ 4.5:1) |
| A11Y-03 | Tüm görsel öğelerde anlamlı `aria-label` veya `alt` metin |
| A11Y-04 | Form alanlarında hata mesajları aria ile bağlanmalı (`aria-describedby`) |
| A11Y-05 | Modal açılışında odak modal içine taşınmalı (focus trap) |
| A11Y-06 | Grafiklere tablo alternatifi sunulmalı (screen reader dostu) |
| A11Y-07 | Animasyonlar `prefers-reduced-motion` tercihine saygı duymalı |

---

## 15. Güvenlik Gereksinimleri

| ID | Gereksinim |
|---|---|
| FE-SEC-01 | Access Token ve Refresh Token yalnızca `httpOnly; Secure; SameSite=Strict` cookie'de saklanmalı |
| FE-SEC-02 | CSRF koruması: SameSite cookie ve `Origin` başlığı kontrolü |
| FE-SEC-03 | XSS: Kullanıcı girdileri doğrudan DOM'a yazılmamalı; Vue'nun reaktif bağlama güvenli kullanılmalı |
| FE-SEC-04 | Snippet kodu sayfada `<code>` içinde gösterilmeli; hiçbir zaman eval edilmemeli |
| FE-SEC-05 | Content Security Policy (CSP) başlıkları Nuxt sunucusu tarafından gönderilmeli |
| FE-SEC-06 | Hassas sayfa yolları (admin) middleware ile rol kontrolüne tabi olmalı |

---

## 16. i18n Gereksinimleri

| ID | Gereksinim |
|---|---|
| I18N-01 | Varsayılan dil Türkçe; İngilizce tam destek |
| I18N-02 | Dil değişimi anlık (sayfa yenilemesi olmadan) |
| I18N-03 | Tarih formatları locale'e göre: TR → `dd.MM.yyyy`, EN → `MM/dd/yyyy` |
| I18N-04 | Sayı formatları locale'e göre: TR → `1.234.567,89`, EN → `1,234,567.89` |
| I18N-05 | Tüm etiket ve mesajlar çeviri dosyasından okunmalı; hardcoded string yasak |

---

## 17. Test Gereksinimleri

| Tür | Araç | Hedef |
|---|---|---|
| Birim Testleri | Vitest + Vue Testing Library | Tüm composable ve util fonksiyonlar |
| Bileşen Testleri | Vitest + @vue/test-utils | Kritik UI bileşenleri |
| E2E Testleri | Playwright | Kullanıcı akışları (login → dashboard → export) |
| Görsel Regresyon | Playwright Screenshots | Kritik sayfa snapshot'ları |
| Erişilebilirlik | axe-core (playwright-axe) | Her sayfada otomatik çalışır |
| Tarayıcı Desteği | Playwright (Chromium, Firefox, WebKit) | Son 2 büyük sürüm |

---

## 18. Geliştirici Deneyimi

| Araç | Amaç |
|---|---|
| ESLint + @nuxt/eslint | Kod kalitesi ve tutarlılık |
| Prettier | Kod biçimlendirme |
| Husky + lint-staged | Commit öncesi otomatik lint ve format |
| Storybook | Bileşen geliştirme ve dokümantasyon |
| TypeScript strict mode | Tip güvenliği |
| Nuxt DevTools | Bileşen ve route debug'lama |

---

## 19. Landing Sayfası (Pazarlama)

| Bölüm | İçerik |
|---|---|
| Hero | Başlık, alt başlık, "Ücretsiz Başla" + "Demo İzle" CTA |
| Özellikler | 6 özellik kartı (ikonlar + kısa açıklama) |
| Ekran Görüntüleri | Dashboard mockup'ları (lightbox galeri) |
| Karşılaştırma | Lumina vs Google Analytics tablo |
| Fiyatlandırma | Ücretsiz / Pro / Kurumsal kart (v1.1) |
| SSS | Accordion bileşeni |
| Footer | Linkler, sosyal medya, telif hakkı |

---

## 20. Gelecek Sürümler

| Özellik | Hedef Sürüm |
|---|---|
| Dönüşüm hunisi görselleştirmesi | v1.1 |
| Özelleştirilebilir dashboard (widget sürükle-bırak) | v1.2 |
| Paylaşılabilir rapor linkleri (parola korumalı) | v1.2 |
| Dark mode otomatik zamanlaması | v1.1 |
| Takım üyesi daveti UI'ı | v1.1 |
| PWA (offline mode) | v2.0 |
| Gelişmiş grafik kütüphanesi (D3.js entegrasyonu) | v2.0 |

---

*Bu belge yaşayan bir dokümandır. Değişiklikler için PR açılmalı ve ekip lideri onayı alınmalıdır.*
