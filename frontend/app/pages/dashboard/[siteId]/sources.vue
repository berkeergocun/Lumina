<template>
  <div class="p-6 md:p-8">
    <AppPageHeader title="Trafik Kaynakları" :description="siteStore.activeSite?.domain">
      <template #actions>
        <AppDateRangeFilter v-model="selectedRange" @update:model-value="fetchData" />
      </template>
    </AppPageHeader>

    <!-- Tabs -->
    <div class="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs mb-6 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="['px-2.5 py-1 rounded font-medium transition-colors', activeTab === tab.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground']"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 8" :key="i" class="h-12 rounded-lg bg-muted animate-pulse" />
    </div>

    <!-- Sources table -->
    <div v-else class="rounded-lg border border-border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{{ tabLabel }}</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ziyaretçi</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">G. Sayısı</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bounce</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in currentData" :key="row[rowKey]" class="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
            <td class="px-4 py-3">
              <span class="text-sm">{{ row[rowKey] || 'Doğrudan' }}</span>
            </td>
            <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ row.visitors?.toLocaleString() ?? '—' }}</td>
            <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ row.pageviews?.toLocaleString() ?? '—' }}</td>
            <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ row.bounceRate ? `${(row.bounceRate * 100).toFixed(0)}%` : '—' }}</td>
          </tr>
          <tr v-if="currentData.length === 0">
            <td colspan="4" class="px-4 py-12 text-center text-muted-foreground">Veri bulunamadı</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReports } from '~/composables/useReports'
import { useSiteStore } from '~/stores/site.store'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getSources } = useReports()
const siteStore = useSiteStore()
const siteId = computed(() => route.params.siteId as string)

const sources = ref<any>(null)
const isLoading = ref(true)
const activeTab = ref('sources')
const selectedRange = ref('30')

const tabs = [
  { label: 'Kaynaklar', value: 'sources' },
  { label: 'Medyum', value: 'mediums' },
  { label: 'Kampanyalar', value: 'campaigns' },
  { label: 'Referrerlar', value: 'referrers' },
]

const tabLabel = computed(() => tabs.find((t) => t.value === activeTab.value)?.label ?? '')
const rowKey = computed(() => {
  if (activeTab.value === 'sources') return 'source'
  if (activeTab.value === 'mediums') return 'medium'
  if (activeTab.value === 'campaigns') return 'campaign'
  return 'referrer'
})

const currentData = computed(() => sources.value?.[activeTab.value] ?? [])

function getDateRange(days: string) {
  const to = new Date()
  const from = new Date()
  if (days !== '0') from.setDate(from.getDate() - parseInt(days))
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(from), to: fmt(to) }
}

async function fetchData() {
  isLoading.value = true
  try {
    const { from, to } = getDateRange(selectedRange.value)
    const res = await getSources({ siteId: siteId.value, from, to })
    if (res.success) sources.value = res.data
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>
