<template>
  <div class="p-6 md:p-8 max-w-2xl mx-auto">
    <div class="mb-8">
      <NuxtLink to="/sites" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <LucideArrowLeft class="size-4" />
        Sitelere Dön
      </NuxtLink>
      <h1 class="text-xl font-bold">Yeni Site Ekle</h1>
    </div>

    <!-- Steps -->
    <div class="flex items-center gap-3 mb-8">
      <template v-for="(step, i) in steps" :key="i">
        <div class="flex items-center gap-2">
          <div
            :class="[
              'size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              currentStep > i
                ? 'bg-foreground text-background'
                : currentStep === i
                  ? 'border-2 border-foreground text-foreground'
                  : 'bg-muted text-muted-foreground'
            ]"
          >
            <LucideCheck v-if="currentStep > i" class="size-3.5" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span :class="['text-sm font-medium', currentStep === i ? 'text-foreground' : 'text-muted-foreground']">
            {{ step }}
          </span>
        </div>
        <div v-if="i < steps.length - 1" class="flex-1 h-px bg-border" />
      </template>
    </div>

    <!-- Step 1: Domain -->
    <div v-if="currentStep === 0" class="space-y-5">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium" for="site-name">Site Adı</label>
          <input
            id="site-name"
            v-model="form.name"
            type="text"
            placeholder="Benim Blogum"
            class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium" for="domain">Alan Adı</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">https://</span>
            <input
              id="domain"
              v-model="form.domain"
              type="text"
              placeholder="orneksite.com"
              class="w-full pl-16 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium" for="timezone">Saat Dilimi</label>
          <select
            id="timezone"
            v-model="form.timezone"
            class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
          </select>
        </div>
      </div>

      <div v-if="error" class="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        <LucideAlertCircle class="size-4 shrink-0" />{{ error }}
      </div>

      <button
        :disabled="!form.name || !form.domain || isLoading"
        class="w-full px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        @click="handleCreate"
      >
        <LucideLoader2 v-if="isLoading" class="size-4 animate-spin" />
        {{ isLoading ? 'Oluşturuluyor...' : 'Devam Et' }}
      </button>
    </div>

    <!-- Step 2: Verification -->
    <div v-else-if="currentStep === 1" class="space-y-5">
      <div class="rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <h3 class="font-semibold mb-1">Site Sahipliğini Doğrulayın</h3>
          <p class="text-sm text-muted-foreground">Aşağıdaki yöntemlerden birini kullanarak sitenizin sahibi olduğunuzu doğrulayın.</p>
        </div>

        <!-- Method Tabs -->
        <div class="flex items-center gap-1 p-1 bg-muted rounded-lg text-sm w-fit">
          <button
            :class="['px-3 py-1.5 rounded font-medium transition-colors', verifyMethod === 'dns' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground']"
            @click="verifyMethod = 'dns'"
          >
            DNS TXT
          </button>
          <button
            :class="['px-3 py-1.5 rounded font-medium transition-colors', verifyMethod === 'meta' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground']"
            @click="verifyMethod = 'meta'"
          >
            HTML Meta
          </button>
        </div>

        <div v-if="verifyMethod === 'dns'" class="space-y-2">
          <p class="text-xs text-muted-foreground">DNS TXT kaydınıza şunu ekleyin:</p>
          <div class="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
            <span class="flex-1">lumina-verify={{ createdSite?.verificationToken }}</span>
            <button class="shrink-0 text-muted-foreground hover:text-foreground" @click="copy(`lumina-verify=${createdSite?.verificationToken}`)">
              <LucideCopy class="size-3.5" />
            </button>
          </div>
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs text-muted-foreground">HTML'nizin <code>&lt;head&gt;</code> bölümüne şunu ekleyin:</p>
          <div class="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
            <span class="flex-1">&lt;meta name="lumina-verify" content="{{ createdSite?.verificationToken }}"&gt;</span>
            <button class="shrink-0 text-muted-foreground hover:text-foreground" @click="copy(`<meta name=\"lumina-verify\" content=\"${createdSite?.verificationToken}\">`)">
              <LucideCopy class="size-3.5" />
            </button>
          </div>
        </div>

        <div v-if="verifyError" class="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <LucideAlertCircle class="size-4 shrink-0" />{{ verifyError }}
        </div>

        <button
          :disabled="isVerifying"
          class="w-full px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          @click="handleVerify"
        >
          <LucideLoader2 v-if="isVerifying" class="size-4 animate-spin" />
          {{ isVerifying ? 'Kontrol ediliyor...' : 'Doğrulamayı Kontrol Et' }}
        </button>
      </div>

      <button class="text-sm text-muted-foreground hover:text-foreground transition-colors" @click="skip">
        Şimdilik atla →
      </button>
    </div>

    <!-- Step 3: Snippet -->
    <div v-else class="space-y-5">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <LucideCheckCircle class="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p class="font-semibold">Site hazır!</p>
            <p class="text-sm text-muted-foreground">Şimdi takip kodunu sitenize ekleyin</p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Takip Kodu</p>
          <div class="relative">
            <pre class="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto whitespace-pre-wrap break-all">{{ snippet?.html }}</pre>
            <button
              class="absolute top-2 right-2 size-7 flex items-center justify-center rounded bg-background border border-border text-muted-foreground hover:text-foreground transition-colors"
              @click="copy(snippet?.html)"
            >
              <LucideCopy class="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <NuxtLink
        :to="`/dashboard/${createdSite?.siteId}`"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
      >
        Dashboard'a Git <LucideArrowRight class="size-4" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LucideArrowLeft,
  LucideCheck,
  LucideAlertCircle,
  LucideLoader2,
  LucideCopy,
  LucideCheckCircle,
  LucideArrowRight,
} from 'lucide-vue-next'
import { useSites } from '~/composables/useSites'

definePageMeta({ layout: 'default', middleware: 'auth' })

const { createSite, verifySite, getSnippet } = useSites()

const steps = ['Alan Adı', 'Doğrulama', 'Entegrasyon']
const currentStep = ref(0)
const verifyMethod = ref<'dns' | 'meta'>('dns')

const form = reactive({ name: '', domain: '', timezone: 'Europe/Istanbul' })
const createdSite = ref<any>(null)
const snippet = ref<any>(null)

const isLoading = ref(false)
const isVerifying = ref(false)
const error = ref('')
const verifyError = ref('')

function copy(text: string) {
  navigator.clipboard.writeText(text)
}

async function handleCreate() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await createSite({ name: form.name, domain: form.domain, timezone: form.timezone })
    if (res.success) {
      createdSite.value = res.data
      currentStep.value = 1
    }
  } catch (err: any) {
    error.value = err?.data?.error?.message ?? 'Site oluşturulamadı.'
  } finally {
    isLoading.value = false
  }
}

async function handleVerify() {
  isVerifying.value = true
  verifyError.value = ''
  try {
    const res = await verifySite(createdSite.value.siteId, verifyMethod.value)
    if (res.success && res.data.isVerified) {
      await loadSnippet()
      currentStep.value = 2
    } else {
      verifyError.value = 'Doğrulama başarısız. Lütfen kodu ekleyip tekrar deneyin.'
    }
  } catch {
    verifyError.value = 'Doğrulama sırasında bir hata oluştu.'
  } finally {
    isVerifying.value = false
  }
}

async function skip() {
  await loadSnippet()
  currentStep.value = 2
}

async function loadSnippet() {
  try {
    const res = await getSnippet(createdSite.value.siteId)
    if (res.success) snippet.value = res.data
  } catch {}
}
</script>
