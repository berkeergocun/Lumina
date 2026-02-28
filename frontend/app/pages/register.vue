<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight">Hesap Oluşturun</h1>
      <p class="text-muted-foreground text-sm mt-1">Lumina Analytics'e ücretsiz katılın</p>
    </div>

    <form v-if="!success" class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="name">Ad Soyad</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Ahmet Yılmaz"
          required
          class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="email">E-posta</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="ornek@sirket.com"
          required
          class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="password">Şifre</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            minlength="8"
            class="w-full px-3 py-2 pr-10 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            @click="showPassword = !showPassword"
          >
            <LucideEye v-if="!showPassword" class="size-4" />
            <LucideEyeOff v-else class="size-4" />
          </button>
        </div>
        <p class="text-xs text-muted-foreground">En az 8 karakter, büyük/küçük harf ve rakam içermeli</p>
      </div>

      <div v-if="error" class="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        <LucideAlertCircle class="size-4 shrink-0" />
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LucideLoader2 v-if="isLoading" class="size-4 animate-spin" />
        <span>{{ isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}</span>
      </button>
    </form>

    <div v-else class="text-center space-y-4 py-4">
      <div class="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
        <LucideCheckCircle class="size-7 text-foreground" />
      </div>
      <div>
        <p class="font-semibold">Kayıt başarılı!</p>
        <p class="text-sm text-muted-foreground mt-1">
          E-posta adresinize doğrulama bağlantısı gönderdik.
        </p>
      </div>
      <NuxtLink
        to="/login"
        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
      >
        Giriş Yap
      </NuxtLink>
    </div>

    <p v-if="!success" class="text-center text-sm text-muted-foreground mt-6">
      Zaten hesabınız var mı?
      <NuxtLink to="/login" class="text-foreground font-medium hover:underline ml-1">Giriş Yap</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { LucideEye, LucideEyeOff, LucideAlertCircle, LucideLoader2, LucideCheckCircle } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { register } = useAuth()

const form = reactive({ name: '', email: '', password: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  isLoading.value = true
  error.value = ''
  try {
    const res = await register(form.name, form.email, form.password)
    if (res.success) success.value = true
  } catch (err: any) {
    const code = err?.data?.error?.code
    if (code === 'EMAIL_EXISTS') error.value = 'Bu e-posta adresi zaten kayıtlı.'
    else error.value = 'Kayıt olurken bir hata oluştu.'
  } finally {
    isLoading.value = false
  }
}
</script>
