<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight">Hoş Geldiniz</h1>
      <p class="text-muted-foreground text-sm mt-1">Hesabınıza giriş yapın</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
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
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium" for="password">Şifre</label>
          <NuxtLink to="/forgot-password" class="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Şifremi unuttum
          </NuxtLink>
        </div>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
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
        <span>{{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}</span>
      </button>
    </form>

    <p class="text-center text-sm text-muted-foreground mt-6">
      Hesabınız yok mu?
      <NuxtLink to="/register" class="text-foreground font-medium hover:underline ml-1">Kayıt Ol</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { LucideEye, LucideEyeOff, LucideAlertCircle, LucideLoader2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  isLoading.value = true
  error.value = ''
  try {
    await login(form.email, form.password)
  } catch (err: any) {
    const code = err?.data?.error?.code
    if (code === 'INVALID_CREDENTIALS') error.value = 'E-posta veya şifre hatalı.'
    else if (code === 'EMAIL_NOT_VERIFIED') error.value = 'E-posta adresiniz henüz doğrulanmamış.'
    else error.value = 'Giriş yapılırken bir hata oluştu.'
  } finally {
    isLoading.value = false
  }
}
</script>
