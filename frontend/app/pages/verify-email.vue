<template>
  <div class="text-center py-4">
    <div v-if="isLoading" class="space-y-4">
      <LucideLoader2 class="size-10 animate-spin mx-auto text-muted-foreground" />
      <p class="text-muted-foreground text-sm">E-posta doğrulanıyor...</p>
    </div>

    <div v-else-if="success" class="space-y-4">
      <div class="size-14 rounded-full bg-muted flex items-center justify-center mx-auto">
        <LucideCheckCircle class="size-7 text-foreground" />
      </div>
      <div>
        <p class="font-semibold text-lg">E-posta doğrulandı!</p>
        <p class="text-sm text-muted-foreground mt-1">Hesabınız aktif. Artık giriş yapabilirsiniz.</p>
      </div>
      <NuxtLink
        to="/login"
        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
      >
        Giriş Yap
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div class="size-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <LucideXCircle class="size-7 text-destructive" />
      </div>
      <div>
        <p class="font-semibold">Doğrulama başarısız</p>
        <p class="text-sm text-muted-foreground mt-1">{{ error }}</p>
      </div>
      <NuxtLink
        to="/login"
        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
      >
        Giriş Sayfasına Dön
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideLoader2, LucideCheckCircle, LucideXCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const config = useRuntimeConfig()

const isLoading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    error.value = 'Doğrulama token\'ı bulunamadı.'
    isLoading.value = false
    return
  }
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/auth/verify-email`, {
      method: 'POST',
      body: { token },
    })
    if (res.success) success.value = true
  } catch {
    error.value = 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.'
  } finally {
    isLoading.value = false
  }
})
</script>
