<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">Yeni Şifre Belirle</h1>
      <p class="text-muted-foreground text-sm mt-1">Güçlü bir şifre seçin</p>
    </div>

    <form v-if="!success" class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="password">Yeni Şifre</label>
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
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
        <span>{{ isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle' }}</span>
      </button>
    </form>

    <div v-else class="text-center space-y-4 py-4">
      <div class="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
        <LucideCheckCircle class="size-7 text-foreground" />
      </div>
      <div>
        <p class="font-semibold">Şifre güncellendi!</p>
        <p class="text-sm text-muted-foreground mt-1">Artık yeni şifrenizle giriş yapabilirsiniz.</p>
      </div>
      <NuxtLink
        to="/login"
        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
      >
        Giriş Yap
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideEye, LucideEyeOff, LucideAlertCircle, LucideLoader2, LucideCheckCircle } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const { resetPassword } = useAuth()
const token = route.query.token as string

const form = reactive({ password: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

async function handleSubmit() {
  if (!token) {
    error.value = 'Geçersiz sıfırlama bağlantısı.'
    return
  }
  isLoading.value = true
  error.value = ''
  try {
    const res = await resetPassword(token, form.password)
    if (res.success) success.value = true
  } catch (err: any) {
    const code = err?.data?.error?.code
    if (code === 'INVALID_TOKEN') error.value = 'Geçersiz token.'
    else if (code === 'TOKEN_EXPIRED') error.value = 'Sıfırlama bağlantısının süresi dolmuş.'
    else error.value = 'Bir hata oluştu.'
  } finally {
    isLoading.value = false
  }
}
</script>
