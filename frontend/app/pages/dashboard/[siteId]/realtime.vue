<template>
  <div class="p-6 md:p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-semibold">Gerçek Zamanlı</h1>
        <div class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border">
          <div :class="['size-2 rounded-full', isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400']" />
          {{ isConnected ? 'Canlı' : 'Bağlanıyor...' }}
        </div>
      </div>
    </div>

    <!-- Active Visitors Counter -->
    <div class="grid gap-4 md:grid-cols-3 mb-8">
      <div class="md:col-span-1 rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center text-center">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Şu An Aktif</p>
        <p class="text-6xl font-black tabular-nums tracking-tight">{{ data?.activeVisitors ?? 0 }}</p>
        <p class="text-xs text-muted-foreground mt-2">ziyaretçi online</p>
      </div>

      <!-- Active Pages -->
      <div class="md:col-span-2 rounded-lg border border-border bg-card p-5">
        <h2 class="text-sm font-semibold mb-4">Aktif Sayfalar</h2>
        <div v-if="data?.activePages?.length" class="space-y-2">
          <div
            v-for="page in data.activePages"
            :key="page.url"
            class="flex items-center gap-3"
          >
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <div class="size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span class="text-xs font-mono text-muted-foreground truncate">{{ page.url }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div
                class="h-1.5 rounded-full bg-foreground/20 overflow-hidden"
                :style="{ width: `${getPageBarWidth(page.count)}px` }"
              >
                <div class="h-full bg-foreground rounded-full" :style="{ width: '100%' }" />
              </div>
              <span class="text-xs font-semibold tabular-nums w-6 text-right">{{ page.count }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground text-sm">
          Aktif sayfa bulunamadı
        </div>
      </div>
    </div>

    <!-- Last 30 minutes & Recent Events -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Recent Events -->
      <div class="rounded-lg border border-border bg-card p-5">
        <h2 class="text-sm font-semibold mb-4">Son Olaylar</h2>
        <div v-if="recentEvents.length" class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(event, i) in recentEvents"
            :key="i"
            class="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
          >
            <div class="size-6 rounded bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <LucideGlobe v-if="event.type === 'pageview'" class="size-3 text-muted-foreground" />
              <LucideZap v-else class="size-3 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium truncate">{{ event.url }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span v-if="event.country" class="text-xs text-muted-foreground">{{ event.country }}</span>
                <span v-if="event.device" class="text-xs text-muted-foreground capitalize">· {{ event.device }}</span>
              </div>
            </div>
            <span class="text-xs text-muted-foreground shrink-0">{{ formatTime(event.timestamp) }}</span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground text-sm">
          Henüz olay yok
        </div>
      </div>

      <!-- Connection info -->
      <div class="rounded-lg border border-border bg-card p-5">
        <h2 class="text-sm font-semibold mb-4">Bilgi</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-border/50">
            <span class="text-sm text-muted-foreground">Bağlantı Durumu</span>
            <span :class="['text-sm font-medium', isConnected ? 'text-emerald-600' : 'text-red-500']">
              {{ isConnected ? 'Bağlı' : 'Bağlantı Kesildi' }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-border/50">
            <span class="text-sm text-muted-foreground">Son Güncelleme</span>
            <span class="text-sm font-medium">{{ lastUpdated }}</span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-border/50">
            <span class="text-sm text-muted-foreground">Güncelleme Aralığı</span>
            <span class="text-sm font-medium">5 saniye</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-muted-foreground">Toplam Olay</span>
            <span class="text-sm font-medium tabular-nums">{{ recentEvents.length }}</span>
          </div>
        </div>

        <button
          v-if="!isConnected"
          class="mt-4 w-full px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          @click="reconnect"
        >
          Yeniden Bağlan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideGlobe, LucideZap } from 'lucide-vue-next'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const siteId = computed(() => route.params.siteId as string)

const data = ref<any>(null)
const recentEvents = ref<any[]>([])
const isConnected = ref(false)
const lastUpdated = ref('—')

let es: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelay = 1000

function formatTime(ts: string) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

function getPageBarWidth(count: number) {
  const max = Math.max(...(data.value?.activePages?.map((p: any) => p.count) ?? [1]), 1)
  return Math.max((count / max) * 120, 8)
}

function connect() {
  if (!import.meta.client) return
  const url = `${config.public.sseBase}/realtime/stream?siteId=${siteId.value}`
  es = new EventSource(url)

  es.onopen = () => {
    isConnected.value = true
    reconnectDelay = 1000
  }

  es.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data)
      data.value = parsed
      if (parsed.recentEvents?.length) {
        recentEvents.value = [
          ...parsed.recentEvents.reverse(),
          ...recentEvents.value,
        ].slice(0, 50)
      }
      lastUpdated.value = formatTime(parsed.timestamp ?? new Date().toISOString())
    } catch {}
  }

  es.onerror = () => {
    isConnected.value = false
    es?.close()
    // Exponential backoff
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 30000)
      connect()
    }, reconnectDelay)
  }
}

function reconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  connect()
}

onMounted(() => {
  connect()
  // Fallback: snapshot if SSE fails
  fetchSnapshot()
})

onUnmounted(() => {
  es?.close()
  if (reconnectTimer) clearTimeout(reconnectTimer)
})

async function fetchSnapshot() {
  try {
    const res = await useApi().apiFetch<any>(`/realtime/snapshot?siteId=${siteId.value}`)
    if (res.success && !isConnected.value) {
      data.value = res.data
      if (res.data.recentEvents) recentEvents.value = res.data.recentEvents
    }
  } catch {}
}
</script>
