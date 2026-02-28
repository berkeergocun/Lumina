<template>
  <div class="p-6 md:p-8">
    <AppPageHeader title="Özel Etkinlikler" :description="siteStore.activeSite?.domain">
      <template #actions>
        <AppDateRangeFilter v-model="selectedRange" @update:model-value="fetchData" />
      </template>
    </AppPageHeader>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="h-14 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-lg border border-border bg-card overflow-hidden">
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
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="selectedEvent = null"
    >
      <div class="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-sm">{{ selectedEvent }}</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Özellik Dağılımı</p>
          </div>
          <button class="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" @click="selectedEvent = null">
            <LucideX class="size-4" />
          </button>
        </div>

        <div v-if="isLoadingProps" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-10 rounded bg-muted animate-pulse" />
        </div>

        <div v-else-if="Object.keys(properties).length === 0" class="py-8 text-center text-sm text-muted-foreground">
          Bu etkinlik için özellik verisi yok
        </div>

        <div v-else class="space-y-4">
          <div v-for="(values, key) in properties" :key="key">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{{ key }}</p>
            <div class="space-y-2">
              <div v-for="val in values" :key="val.value" class="flex items-center gap-3">
                <span class="text-sm flex-1 truncate">{{ val.value }}</span>
                <div class="w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                  <div class="h-full bg-foreground rounded-full" :style="{ width: `${val.percentage * 100}%` }" />
                </div>
                <span class="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">{{ (val.percentage * 100).toFixed(0) }}%</span>
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
import { useSiteStore } from '~/stores/site.store'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getEvents, getEventProperties } = useReports()
const siteStore = useSiteStore()
const siteId = computed(() => route.params.siteId as string)

const events = ref<any[]>([])
const isLoading = ref(true)
const selectedEvent = ref<string | null>(null)
const properties = ref<any>({})
const isLoadingProps = ref(false)
const selectedRange = ref('30')

function getDateRange(days: string) {
  const to = new Date()
  const from = new Date()
  if (days !== '0') from.setDate(from.getDate() - parseInt(days))
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(from), to: fmt(to) }
}

function formatDate(ts: string) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

async function loadProperties(eventName: string) {
  selectedEvent.value = eventName
  isLoadingProps.value = true
  properties.value = {}
  try {
    const { from, to } = getDateRange(selectedRange.value)
    const res = await getEventProperties(eventName, { siteId: siteId.value, from, to })
    if (res.success) properties.value = res.data.properties
  } finally {
    isLoadingProps.value = false
  }
}

async function fetchData() {
  isLoading.value = true
  try {
    const { from, to } = getDateRange(selectedRange.value)
    const res = await getEvents({ siteId: siteId.value, from, to })
    if (res.success) events.value = res.data
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>
