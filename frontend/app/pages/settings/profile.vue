<template>
  <div class="p-6 md:p-8 max-w-xl">
    <h1 class="text-xl font-bold mb-8">Profil Ayarları</h1>

    <form class="space-y-6" @submit.prevent="save">
      <!-- Avatar Section -->
      <div class="flex items-center gap-5">
        <div class="size-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
          {{ avatarInitial }}
        </div>
        <div>
          <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <div class="h-px bg-border" />

      <div class="space-y-2">
        <label class="text-sm font-medium">Ad Soyad</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">E-posta</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div v-if="error" class="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{{ error }}</div>

      <div v-if="success" class="p-3 rounded-md bg-emerald-100 text-emerald-700 text-sm">Profil güncellendi.</div>

      <button
        type="submit"
        :disabled="isSaving"
        class="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <LucideLoader2 v-if="isSaving" class="size-4 animate-spin" />
        Kaydet
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { LucideLoader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'default', middleware: 'auth' })

const authStore = useAuthStore()
const { apiFetch } = useApi()

const form = reactive({
  name: authStore.user?.name ?? '',
  email: authStore.user?.email ?? '',
})

const isSaving = ref(false)
const error = ref('')
const success = ref(false)

const avatarInitial = computed(() => form.name?.charAt(0).toUpperCase() ?? '?')

async function save() {
  isSaving.value = true
  error.value = ''
  success.value = false
  try {
    const res = await apiFetch<any>('/auth/me', {
      method: 'PUT',
      body: { name: form.name, email: form.email },
    })
    if (res.success) {
      authStore.setAuth({
        user: { ...authStore.user!, name: form.name, email: form.email },
        accessToken: authStore.accessToken!,
        refreshToken: authStore.refreshToken ?? '',
      })
      success.value = true
    } else {
      error.value = 'Güncelleme sırasında hata oluştu.'
    }
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Güncelleme başarısız.'
  } finally {
    isSaving.value = false
  }
}
</script>
