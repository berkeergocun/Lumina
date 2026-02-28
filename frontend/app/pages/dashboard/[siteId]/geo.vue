<template>
  <div class="p-6 md:p-8">
    <AppPageHeader title="Coğrafi Dağılım" :description="siteStore.activeSite?.domain">
      <template #actions>
        <AppDateRangeFilter v-model="selectedRange" @update:model-value="fetchData" />
      </template>
    </AppPageHeader>

    <div v-if="isLoading" class="space-y-4">
      <div class="h-64 rounded-lg bg-muted animate-pulse" />
      <div class="h-48 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <!-- Country Table -->
      <div class="rounded-lg border border-border bg-card overflow-hidden">
        <div class="px-4 py-3 border-b border-border">
          <h2 class="text-sm font-semibold">Ülkeler</h2>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ülke</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ziyaretçi</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">G. Sayısı</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">%</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="country in countries"
              :key="country.country"
              class="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <span class="text-base">{{ getFlagEmoji(country.country) }}</span>
                  <span>{{ country.countryName }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ country.visitors?.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ country.pageviews?.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div class="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div class="h-full bg-foreground rounded-full" :style="{ width: `${getPercent(country.visitors)}%` }" />
                  </div>
                  <span class="text-xs text-muted-foreground tabular-nums w-10 text-right">{{ getPercent(country.visitors).toFixed(1) }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="countries.length === 0">
              <td colspan="4" class="px-4 py-12 text-center text-muted-foreground">Veri bulunamadı</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cities -->
      <div v-if="cities.length > 0" class="rounded-lg border border-border bg-card overflow-hidden">
        <div class="px-4 py-3 border-b border-border">
          <h2 class="text-sm font-semibold">Şehirler</h2>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Şehir</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ziyaretçi</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">G. Sayısı</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="city in cities" :key="`${city.city}-${city.country}`" class="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3">
                <span class="mr-2">{{ getFlagEmoji(city.country) }}</span>{{ city.city }}
              </td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ city.visitors?.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ city.pageviews?.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReports } from '~/composables/useReports'
import { useSiteStore } from '~/stores/site.store'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getGeo } = useReports()
const siteStore = useSiteStore()
const siteId = computed(() => route.params.siteId as string)

const countries = ref<any[]>([])
const cities = ref<any[]>([])
const isLoading = ref(true)
const selectedRange = ref('30')

function getDateRange(days: string) {
  const to = new Date()
  const from = new Date()
  if (days !== '0') from.setDate(from.getDate() - parseInt(days))
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(from), to: fmt(to) }
}

function getFlagEmoji(code: string) {
  if (!code || code.length !== 2) return '\u{1F310}'
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1F1E0 + c.charCodeAt(0) - 65))
}

function getPercent(visitors: number) {
  const total = countries.value.reduce((s, c) => s + c.visitors, 0) || 1
  return (visitors / total) * 100
}

async function fetchData() {
  isLoading.value = true
  try {
    const { from, to } = getDateRange(selectedRange.value)
    const res = await getGeo({ siteId: siteId.value, from, to })
    if (res.success) {
      countries.value = res.data.countries
      cities.value = res.data.cities
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
</script>
