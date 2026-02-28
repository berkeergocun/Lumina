<template>
  <div class="p-6 md:p-8">
    <h1 class="text-xl font-bold mb-8">Özel Etkinlikler</h1>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Etkinlik</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tetiklenme</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Benzersiz Kullanıcı</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Son Görülme</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="event in events"
              :key="event.name"
              class="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              @click="loadProperties(event.name)"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="size-7 rounded-md bg-muted flex items-center justify-center">
                    <LucideZap class="size-3.5 text-muted-foreground" />
                  </div>
                  <span class="font-medium">{{ event.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ event.count?.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ event.uniqueVisitors?.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground text-xs">{{ formatDate(event.lastSeen) }}</td>
            </tr>
            <tr v-if="events.length === 0">
              <td colspan="4" class="px-4 py-12 text-center text-muted-foreground">Henüz özel etkinlik yok</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Properties Modal -->
    <div
      v-if="selectedEvent"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="selectedEvent = null"
    >
      <div class="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold">{{ selectedEvent }}</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Özellik Dağılımı</p>
          </div>
          <button class="text-muted-foreground hover:text-foreground" @click="selectedEvent = null">
            <LucideX class="size-4" />
          </button>
        </div>

        <div v-if="isLoadingProps" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-10 rounded bg-muted animate-pulse" />
        </div>

        <div v-else class="space-y-4">
          <div v-for="(values, key) in properties" :key="key">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{{ key }}</p>
            <div class="space-y-2">
              <div v-for="val in values" :key="val.value" class="flex items-center gap-3">
                <span class="text-sm flex-1">{{ val.value }}</span>
                <div class="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div class="h-full bg-foreground rounded-full" :style="{ width: `${val.percentage * 100}%` }" />
                </div>
                <span class="text-xs text-muted-foreground tabular-nums w-12 text-right">{{ (val.percentage * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideZap, LucideX } from 'lucide-vue-next'
import { useReports } from '~/composables/useReports'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getEvents, getEventProperties } = useReports()
const siteId = computed(() => route.params.siteId as string)

const events = ref<any[]>([])
const isLoading = ref(true)
const selectedEvent = ref<string | null>(null)
const properties = ref<any>({})
const isLoadingProps = ref(false)

function formatDate(ts: string) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

async function loadProperties(eventName: string) {
  selectedEvent.value = eventName
  isLoadingProps.value = true
  try {
    const res = await getEventProperties(eventName, { siteId: siteId.value })
    if (res.success) properties.value = res.data.properties
  } finally {
    isLoadingProps.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getEvents({ siteId: siteId.value })
    if (res.success) events.value = res.data
  } finally {
    isLoading.value = false
  }
})
</script>
