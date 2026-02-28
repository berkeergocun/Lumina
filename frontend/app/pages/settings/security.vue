<template>
  <div class="p-6 md:p-8 max-w-xl space-y-10">
    <h1 class="text-xl font-bold">Güvenlik</h1>

    <!-- Change Password -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="text-sm font-semibold mb-5">Şifre Değiştir</h2>
      <form class="space-y-4" @submit.prevent="changePassword">
        <div class="space-y-2">
          <label class="text-sm font-medium">Mevcut Şifre</label>
          <div class="relative">
            <input
              v-model="pwForm.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              required
              class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring pr-10"
            />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" @click="showCurrent = !showCurrent">
              <LucideEye v-if="!showCurrent" class="size-4" />
              <LucideEyeOff v-else class="size-4" />
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Yeni Şifre</label>
          <div class="relative">
            <input
              v-model="pwForm.newPassword"
              :type="showNew ? 'text' : 'password'"
              required
              minlength="8"
              class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring pr-10"
            />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" @click="showNew = !showNew">
              <LucideEye v-if="!showNew" class="size-4" />
              <LucideEyeOff v-else class="size-4" />
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Yeni Şifre (Tekrar)</label>
          <input
            v-model="pwForm.confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div v-if="pwError" class="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{{ pwError }}</div>
        <div v-if="pwSuccess" class="p-3 rounded-md bg-emerald-100 text-emerald-700 text-sm">Şifre güncellendi.</div>

        <button
          type="submit"
          :disabled="isSavingPw"
          class="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <LucideLoader2 v-if="isSavingPw" class="size-4 animate-spin" />
          Şifreyi Değiştir
        </button>
      </form>
    </div>

    <!-- 2FA -->
    <div class="rounded-xl border border-border bg-card p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-sm font-semibold">İki Faktörlü Doğrulama (2FA)</h2>
          <p class="text-xs text-muted-foreground mt-1">Hesabınıza giriş yaparken ek doğrulama istenecektir.</p>
        </div>
        <span
          :class="[
            'text-xs font-medium px-2 py-0.5 rounded-full',
            twoFAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
          ]"
        >
          {{ twoFAEnabled ? 'Aktif' : 'Pasif' }}
        </span>
      </div>

      <!-- Setup 2FA -->
      <div v-if="!twoFAEnabled">
        <div v-if="!totpSetup">
          <button
            class="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors"
            :disabled="isSetupLoading"
            @click="setup2FA"
          >
            <LucideLoader2 v-if="isSetupLoading" class="size-4 animate-spin" />
            <LucideShield v-else class="size-4" />
            2FA Kur
          </button>
        </div>
        <div v-else class="space-y-4">
          <p class="text-sm text-muted-foreground">Authenticator uygulamanızla QR kodu tarayın:</p>
          <img :src="totpSetup.qrCodeUrl" alt="QR Code" class="size-40 rounded-lg border border-border" />
          <p class="text-xs text-muted-foreground break-all">Anahtar: <code class="font-mono">{{ totpSetup.secret }}</code></p>
          <div class="space-y-2">
            <label class="text-sm font-medium">Onay Kodu</label>
            <input
              v-model="totpToken"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div v-if="totpError" class="text-xs text-destructive">{{ totpError }}</div>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            :disabled="isVerifyLoading"
            @click="verify2FA"
          >
            <LucideLoader2 v-if="isVerifyLoading" class="size-4 animate-spin" />
            Doğrula ve Etkinleştir
          </button>
        </div>
      </div>

      <div v-else>
        <button
          class="flex items-center gap-2 px-4 py-2 border border-destructive/40 text-destructive text-sm font-medium rounded-md hover:bg-destructive/5 transition-colors"
          @click="disable2FA"
        >
          <LucideShieldOff class="size-4" />
          2FA'yı Devre Dışı Bırak
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideEye, LucideEyeOff, LucideLoader2, LucideShield, LucideShieldOff } from 'lucide-vue-next'

definePageMeta({ layout: 'default', middleware: 'auth' })

const { apiFetch } = useApi()

// Password
const pwForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showCurrent = ref(false)
const showNew = ref(false)
const isSavingPw = ref(false)
const pwError = ref('')
const pwSuccess = ref(false)

async function changePassword() {
  if (pwForm.newPassword !== pwForm.confirmPassword) { pwError.value = 'Şifreler eşleşmiyor.'; return }
  isSavingPw.value = true; pwError.value = ''; pwSuccess.value = false
  try {
    const res = await apiFetch<any>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
    })
    if (res.success) { pwSuccess.value = true; pwForm.currentPassword = ''; pwForm.newPassword = ''; pwForm.confirmPassword = '' }
    else pwError.value = 'Şifre değiştirme başarısız.'
  } catch (e: any) {
    pwError.value = e?.data?.message ?? 'Hata oluştu.'
  } finally { isSavingPw.value = false }
}

// 2FA
const twoFAEnabled = ref(false)
const totpSetup = ref<any>(null)
const totpToken = ref('')
const totpError = ref('')
const isSetupLoading = ref(false)
const isVerifyLoading = ref(false)

async function setup2FA() {
  isSetupLoading.value = true
  try {
    const res = await apiFetch<any>('/auth/2fa/setup', { method: 'POST' })
    if (res.success) totpSetup.value = res.data
  } finally { isSetupLoading.value = false }
}

async function verify2FA() {
  isVerifyLoading.value = true; totpError.value = ''
  try {
    const res = await apiFetch<any>('/auth/2fa/verify', { method: 'POST', body: { token: totpToken.value } })
    if (res.success) { twoFAEnabled.value = true; totpSetup.value = null }
    else totpError.value = 'Geçersiz kod.'
  } catch { totpError.value = 'Doğrulama başarısız.' }
  finally { isVerifyLoading.value = false }
}

async function disable2FA() {
  await apiFetch('/auth/2fa/disable', { method: 'POST' })
  twoFAEnabled.value = false
}

onMounted(async () => {
  const res = await apiFetch<any>('/auth/me')
  if (res.success) twoFAEnabled.value = res.data.twoFactorEnabled ?? false
})
</script>
