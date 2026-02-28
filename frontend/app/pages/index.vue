<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <!-- Navbar -->
    <header class="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <div class="flex items-center gap-2 font-bold text-lg">
          <div class="size-7 rounded-md bg-foreground flex items-center justify-center text-background text-sm font-black">L</div>
          Lumina
        </div>
        <nav class="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" class="hover:text-foreground transition-colors">Özellikler</a>
          <a href="#pricing" class="hover:text-foreground transition-colors">Fiyatlar</a>
          <a href="#faq" class="hover:text-foreground transition-colors">SSS</a>
        </nav>
        <div class="flex items-center gap-3">
          <NuxtLink to="/login" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Giriş</NuxtLink>
          <NuxtLink to="/register" class="px-3 py-1.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
            Başla
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="pt-32 pb-24 px-6 text-center">
      <div class="max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-8">
          <span class="size-1.5 rounded-full bg-emerald-500"></span>
          Açık beta — ücretsiz dene
        </div>
        <h1 class="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
          Web analitiği<br />
          <span class="text-muted-foreground">gizlilik önce gelir</span>
        </h1>
        <p class="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Lumina, kullanıcı gizliliğini koruyarak siteniz hakkında ihtiyaç duyduğunuz her şeyi ölçer.
          Çerez yok, kişisel veri toplamaz, GDPR uyumlu.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink to="/register" class="px-6 py-3 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            Ücretsiz Başla
            <LucideArrowRight class="size-4" />
          </NuxtLink>
          <a href="#features" class="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Nasıl çalışır?
          </a>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="border-y border-border bg-muted/30 py-8">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-6">
        <div v-for="stat in stats" :key="stat.label">
          <p class="text-3xl font-black">{{ stat.value }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-24 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-black mb-3">Her şeyi ölç, kimseyi takip etme</h2>
          <p class="text-muted-foreground">Lumina yalnızca ihtiyaç duyduğunuz verileri toplar.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-5">
          <div v-for="feat in features" :key="feat.title" class="p-6 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
            <div class="size-10 rounded-lg bg-muted flex items-center justify-center mb-4">
              <component :is="feat.icon" class="size-5" />
            </div>
            <h3 class="font-semibold mb-2">{{ feat.title }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ feat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-24 px-6 bg-muted/30 border-y border-border">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-black mb-16">3 adımda devreye al</h2>
        <div class="space-y-8">
          <div v-for="(step, i) in steps" :key="i" class="flex items-start gap-5 text-left">
            <div class="size-9 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-bold shrink-0">{{ i + 1 }}</div>
            <div>
              <h3 class="font-semibold mb-1">{{ step.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Table -->
    <section id="pricing" class="py-24 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-black mb-3">Neden Lumina?</h2>
          <p class="text-muted-foreground">Diğer analitik araçlarıyla karşılaştırın</p>
        </div>
        <div class="rounded-xl border border-border overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/50">
                <th class="text-left px-5 py-3 font-semibold">Özellik</th>
                <th class="text-center px-5 py-3 font-semibold">Lumina</th>
                <th class="text-center px-5 py-3 font-semibold text-muted-foreground">Google Analytics</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparison" :key="row.feature" class="border-b border-border/50 last:border-0">
                <td class="px-5 py-3">{{ row.feature }}</td>
                <td class="px-5 py-3 text-center">
                  <span v-if="row.lumina === true" class="text-emerald-600">✓</span>
                  <span v-else-if="row.lumina === false" class="text-muted-foreground">—</span>
                  <span v-else class="text-xs">{{ row.lumina }}</span>
                </td>
                <td class="px-5 py-3 text-center text-muted-foreground">
                  <span v-if="row.ga === true" class="text-emerald-600">✓</span>
                  <span v-else-if="row.ga === false">✕</span>
                  <span v-else class="text-xs">{{ row.ga }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-24 px-6 border-t border-border bg-muted/20">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-black text-center mb-12">Sıkça Sorulan Sorular</h2>
        <div class="space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              class="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm"
              @click="openFaq = openFaq === i ? null : i"
            >
              {{ faq.q }}
              <LucideChevronDown :class="['size-4 text-muted-foreground transition-transform shrink-0 ml-4', openFaq === i ? 'rotate-180' : '']" />
            </button>
            <div v-if="openFaq === i" class="px-5 pb-4 text-sm text-muted-foreground">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 px-6 text-center">
      <div class="max-w-xl mx-auto">
        <h2 class="text-4xl font-black mb-4">Sitenizi anlamaya başlayın</h2>
        <p class="text-muted-foreground mb-8">5 dakikada kurulum. Kredi kartı gerektirmez.</p>
        <NuxtLink to="/register" class="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-opacity text-base">
          Ücretsiz Hesap Oluştur
          <LucideArrowRight class="size-4" />
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-border py-8 px-6">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-2 font-semibold text-foreground">
          <div class="size-5 rounded bg-foreground flex items-center justify-center text-background text-xs font-black">L</div>
          Lumina
        </div>
        <p>© {{ new Date().getFullYear() }} Lumina Analytics. Tüm hakları saklıdır.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-foreground transition-colors">Gizlilik</a>
          <a href="#" class="hover:text-foreground transition-colors">Kullanım Koşulları</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  LucideArrowRight,
  LucideBarChart2,
  LucideChevronDown,
  LucideGlobe,
  LucideLock,
  LucideMonitor,
  LucideRadio,
  LucideZap,
} from 'lucide-vue-next'

definePageMeta({ layout: false })

const openFaq = ref<number | null>(null)

const stats = [
  { value: '< 1KB', label: 'Tracker boyutu' },
  { value: '0 🍪', label: 'Çerez kullanımı' },
  { value: '100%', label: 'GDPR uyumlu' },
  { value: 'Gerçek zamanlı', label: 'Veri güncelleme' },
]

const features = [
  { icon: LucideBarChart2, title: 'Anlık Metrikler', description: 'Sayfa görüntülenme, oturum süresi, bounce rate ve daha fazlası — tümü tek panelden.' },
  { icon: LucideRadio, title: 'Gerçek Zamanlı', description: 'Şu anda sitenizde kaç kişi var? Hangi sayfaları görüntülüyorlar? Anlık olarak izleyin.' },
  { icon: LucideGlobe, title: 'Coğrafi Analiz', description: 'Ziyaretçilerinizin nerede olduğunu, hangi cihazları kullandığını ülke ve şehir bazında görün.' },
  { icon: LucideLock, title: 'Gizlilik Önce', description: 'Çerez kullanmaz, IP adreslerini saklamaz. GDPR, PECR ve CCPA uyumlu.' },
  { icon: LucideZap, title: 'Özel Etkinlikler', description: '1 satır JS ile form gönderimi, buton tıklaması gibi etkinlikleri takip edin.' },
  { icon: LucideMonitor, title: 'Kolay Entegrasyon', description: 'Bir <script> etiketi ekleyin — tamamdır. WordPress, Shopify, Next.js her platforma uyar.' },
]

const steps = [
  { title: 'Hesap oluşturun', description: 'E-posta adresinizle 30 saniyede ücretsiz kayıt olun.' },
  { title: 'Sitenizi ekleyin', description: 'Domain adresinizi girin ve snippet kodunu kopyalayın.' },
  { title: 'Veri akmaya başlasın', description: 'Kodunuzu yapıştırın, 5 dakika içinde ziyaretçi verisi görmeye başlayın.' },
]

const comparison = [
  { feature: 'GDPR Uyumlu', lumina: true, ga: false },
  { feature: 'Çerez gerektirmez', lumina: true, ga: false },
  { feature: 'Gerçek zamanlı izleme', lumina: true, ga: true },
  { feature: 'Özel etkinlikler', lumina: true, ga: true },
  { feature: 'Veri ihracı', lumina: true, ga: '⚡ ücretli' },
  { feature: 'Sayfa ağırlığı', lumina: '< 1KB', ga: '> 40KB' },
  { feature: 'Veri paylaşımı 3. taraf ile', lumina: false, ga: true },
]

const faqs = [
  { q: 'Lumina gerçekten çerez kullanmıyor mu?', a: 'Evet. Lumina hiçbir izleme çerezi veya yerel depolama kullanmaz. Ziyaretçiler anonimleştirilmiş parmak izi yöntemi ile sayılır.' },
  { q: 'Mevcut sitem için entegrasyon ne kadar sürer?', a: "Tek bir <script> etiketi eklemeniz yeterlidir. WordPress, Shopify veya herhangi bir HTML sayfasına 5 dakikada kurabilirsiniz." },
  { q: 'Verilerimi dışa aktarabilir miyim?', a: 'Evet. CSV veya JSON formatında istediğiniz tarih aralığını dışa aktarabilirsiniz.' },
  { q: 'Kaç site ekleyebilirim?', a: 'Açık beta süresince site sayısı sınırsızdır. Genel yayın öncesi fiyatlandırma planlarını duyuracağız.' },
]
</script>
