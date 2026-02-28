<template>
  <div class="p-6 md:p-8 max-w-xl mx-auto">
    <h1 class="text-lg font-semibold mb-6">Veri Dışa Aktar</h1>

    <div class="rounded-lg border border-border bg-card p-6 space-y-5">
      <div class="space-y-2">
        <label class="text-sm font-medium">Rapor Türü</label>
        <select v-model="form.type" class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="events">Etkinlikler</option>
          <option value="sessions">Oturumlar</option>
          <option value="pages">Sayfalar</option>
          <option value="sources">Kaynaklar</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <label class="text-sm font-medium">Başlangıç</label>
          <input v-model="form.from" type="date" class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Bitiş</label>
          <input v-model="form.to" type="date" class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Format</label>
        <div class="flex gap-3">
          <label
            v-for="fmt in ['csv', 'json']"
            :key="fmt"
            :class="['flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-colors flex-1 justify-center', form.format === fmt ? 'border-foreground bg-foreground/5' : 'border-border hover:bg-muted']"
          >
            <input v-model="form.format" type="radio" :value="fmt" class="hidden" />
            <span class="text-sm font-medium uppercase">{{ fmt }}</span>
          </label>
        </div>
      </div>

      <button
        :disabled="isExporting"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        @click="startExport"
      >
        <LucideLoader2 v-if="isExporting" class="size-4 animate-spin" />
        <LucideDownload v-else class="size-4" />
        {{ isExporting ? 'Hazırlanıyor...' : 'Dışa Aktar' }}
      </button>
    </div>

    <!-- Job Status -->
    <div v-if="job" class="mt-4 rounded-lg border border-border bg-card p-5 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">{{ jobStatusLabel }}</span>
        <span
          :class="[
            'text-xs font-medium px-2 py-0.5 rounded-full',
            job.status === 'completed'
              ? 'bg-emerald-100 text-emerald-700'
              : job.status === 'failed'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
          ]"
        >
          {{ job.status }}
        </span>
      </div>

      <div class="h-2 rounded-full bg-muted overflow-hidden">
        <div
          class="h-full rounded-full bg-foreground transition-all duration-500"
          :style="{ width: `${job.progress ?? 0}%` }"
        />
      </div>

      <div v-if="job.status === 'completed' && job.downloadUrl">
        <a
          :href="job.downloadUrl"
          :download="`lumina-export.${form.format}`"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
        >
          <LucideDownload class="size-4" />
          İndir ({{ job.rowCount?.toLocaleString() }} satır)
        </a>
      </div>

      <p v-if="job.status === 'failed'" class="text-sm text-destructive">{{ job.error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideDownload, LucideLoader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { apiFetch } = useApi()
const siteId = computed(() => route.params.siteId as string)

const today = new Date().toISOString().split('T')[0]
const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

const form = reactive({ type: 'events', from: thirtyAgo, to: today, format: 'csv' })
const job = ref<any>(null)
const isExporting = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const jobStatusLabel = computed(() => {
  if (!job.value) return ''
  const map: Record<string, string> = { pending: 'Bekleniyor', processing: 'İşleniyor', completed: 'Tamamlandı', failed: 'Hata' }
  return map[job.value.status] ?? job.value.status
})

async function startExport() {
  isExporting.value = true
  job.value = null
  try {
    const res = await apiFetch<any>('/export', {
      method: 'POST',
      body: { siteId: siteId.value, type: form.type, format: form.format, from: form.from, to: form.to },
    })
    if (res.success) {
      job.value = { ...res.data, status: 'pending', progress: 0 }
      pollStatus(res.data.jobId)
    }
  } finally {
    isExporting.value = false
  }
}

function pollStatus(jobId: string) {
  pollTimer = setInterval(async () => {
    try {
      const res = await apiFetch<any>(`/export/${jobId}/status`)
      if (res.success) {
        job.value = res.data
        if (['completed', 'failed'].includes(res.data.status)) {
          clearInterval(pollTimer!)
        }
      }
    } catch {}
  }, 2000)
}

onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>
