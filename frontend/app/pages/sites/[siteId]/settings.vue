<template>
  <div class="p-6 md:p-8 max-w-2xl mx-auto">
    <div class="mb-6">
      <NuxtLink :to="`/sites`" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <LucideArrowLeft class="size-4" />
        Sitelere Dön
      </NuxtLink>
      <h1 class="text-lg font-semibold">Site Ayarları</h1>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="h-16 rounded-lg bg-muted animate-pulse" />
    </div>

    <form v-else class="space-y-6" @submit.prevent="handleSave">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 class="text-sm font-semibold">Genel Bilgiler</h2>
        <div class="space-y-2">
          <label class="text-sm font-medium">Site Adı</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Alan Adı</label>
          <input
            :value="site?.domain"
            type="text"
            disabled
            class="w-full px-3 py-2 text-sm border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Saat Dilimi</label>
          <select
            v-model="form.timezone"
            class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 justify-end">
        <button
          type="submit"
          :disabled="isSaving"
          class="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          <LucideLoader2 v-if="isSaving" class="size-4 animate-spin" />
          {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
        </button>
      </div>

      <div v-if="saved" class="flex items-center gap-2 p-3 rounded-md bg-emerald-100/50 text-emerald-700 text-sm dark:bg-emerald-900/20 dark:text-emerald-400">
        <LucideCheckCircle class="size-4" />Ayarlar kaydedildi
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { LucideArrowLeft, LucideLoader2, LucideCheckCircle } from 'lucide-vue-next'
import { useSites } from '~/composables/useSites'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getSite, updateSite } = useSites()

const siteId = computed(() => route.params.siteId as string)
const site = ref<any>(null)
const form = reactive({ name: '', timezone: 'Europe/Istanbul' })
const isLoading = ref(true)
const isSaving = ref(false)
const saved = ref(false)

onMounted(async () => {
  try {
    const res = await getSite(siteId.value)
    if (res.success) {
      site.value = res.data
      form.name = res.data.name
      form.timezone = res.data.timezone
    }
  } finally {
    isLoading.value = false
  }
})

async function handleSave() {
  isSaving.value = true
  saved.value = false
  try {
    await updateSite(siteId.value, { name: form.name, timezone: form.timezone })
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } finally {
    isSaving.value = false
  }
}
</script>
