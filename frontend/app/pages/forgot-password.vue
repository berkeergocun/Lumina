<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">Şifremi Unuttum</h1>
      <p class="text-muted-foreground text-sm mt-1">E-posta adresinize sıfırlama bağlantısı göndereceğiz</p>
    </div>

    <form v-if="!sent" class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="email">E-posta</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="ornek@sirket.com"
          required
          class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LucideLoader2 v-if="isLoading" class="size-4 animate-spin" />
        <span>{{ isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder' }}</span>
      </button>
    </form>

    <div v-else class="text-center space-y-4 py-4">
      <div class="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
        <LucideMail class="size-7 text-foreground" />
      </div>
      <div>
        <p class="font-semibold">E-posta gönderildi</p>
        <p class="text-sm text-muted-foreground mt-1">
          <span class="font-medium text-foreground">{{ email }}</span> adresine sıfırlama bağlantısı gönderdik.
        </p>
      </div>
    </div>

    <p class="text-center text-sm text-muted-foreground mt-6">
      <NuxtLink to="/login" class="inline-flex items-center gap-1 text-foreground hover:underline">
        <LucideArrowLeft class="size-3" />
        Giriş sayfasına dön
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { LucideLoader2, LucideMail, LucideArrowLeft } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const { forgotPassword } = useAuth()
const email = ref('')
const isLoading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  isLoading.value = true
  try {
    await forgotPassword(email.value)
    sent.value = true
  } catch {
    sent.value = true // Her durumda gönderildi mesajı göster (güvenlik)
  } finally {
    isLoading.value = false
  }
}
</script>
