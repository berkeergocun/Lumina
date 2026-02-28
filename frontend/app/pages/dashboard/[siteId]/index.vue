<template>
  <div class="p-6 md:p-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-xl font-bold">Genel Bakış</h1>
        <p class="text-muted-foreground text-sm mt-0.5">{{ siteStore.activeSite?.domain ?? '' }}</p>
      </div>

      <!-- Date Range Selector -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 p-1 bg-muted rounded-lg text-sm">
          <button
            v-for="range in dateRanges"
            :key="range.value"
            :class="[
              'px-3 py-1.5 rounded-md font-medium transition-colors',
              selectedRange === range.value
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            ]"
            @click="selectRange(range.value)"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <MetricCard
        label="Benzersiz Ziyaretçi"
        :value="overview?.uniqueVisitors ?? 0"
        :icon="LucideUsers"
        :loading="isLoading"
      />
      <MetricCard
        label="Sayfa Görüntüleme"
        :value="overview?.pageviews ?? 0"
        :icon="LucideEye"
        :loading="isLoading"
      />
      <MetricCard
        label="Oturum"
        :value="overview?.sessions ?? 0"
        :icon="LucideActivity"
        :loading="isLoading"
      />
      <MetricCard
        label="Ortalama Süre"
        :value="overview?.avgSessionDuration ?? 0"
        :icon="LucideClock"
        format="duration"
        :loading="isLoading"
      />
      <MetricCard
        label="Hemen Çıkma"
        :value="overview?.bounceRate ?? 0"
        :icon="LucideArrowUpRight"
        format="percent"
        :loading="isLoading"
      />
      <MetricCard
        label="Sayfa / Oturum"
        :value="overview?.pagesPerSession?.toFixed(2) ?? '0.00'"
        :icon="LucideLayoutGrid"
        :loading="isLoading"
      />
    </div>

    <!-- Chart -->
    <div class="rounded-xl border border-border bg-card p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold">Zaman Serisi</h2>
        <div class="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs">
          <button
            v-for="g in granularities"
            :key="g.value"
            :class="[
              'px-2.5 py-1 rounded font-medium transition-colors',
              granularity === g.value
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            ]"
            @click="granularity = g.value"
          >
            {{ g.label }}
          </button>
        </div>
      </div>

      <!-- Simple Chart -->
      <div v-if="isLoadingTimeseries" class="h-48 rounded-lg bg-muted animate-pulse" />
      <div v-else-if="timeseries.length > 0" class="h-48 flex items-end gap-1">
        <div
          v-for="(point, i) in timeseries"
          :key="i"
          class="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
          :title="`${point.date}: ${point.pageviews} görüntüleme`"
        >
          <div
            class="w-full rounded-sm bg-foreground/80 group-hover:bg-foreground transition-colors"
            :style="{ height: `${getBarHeight(point.pageviews)}%`, minHeight: '2px' }"
          />
        </div>
      </div>
      <div v-else class="h-48 flex items-center justify-center text-muted-foreground text-sm">
        Bu dönem için veri bulunamadı
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div class="flex items-center gap-1.5">
          <div class="size-2.5 rounded-sm bg-foreground" />
          Sayfa Görüntüleme
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Top Pages -->
      <div class="rounded-xl border border-border bg-card p-5">
        <h2 class="text-sm font-semibold mb-4">En Çok Ziyaret Edilen Sayfalar</h2>
        <div v-if="isLoadingPages" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-8 rounded bg-muted animate-pulse" />
        </div>
        <div v-else-if="topPages.length > 0" class="space-y-2">
          <div v-for="page in topPages" :key="page.url" class="flex items-center justify-between gap-3 text-sm py-1.5">
            <div class="flex items-center gap-2 min-w-0">
              <LucideFileText class="size-3.5 shrink-0 text-muted-foreground" />
              <span class="truncate text-muted-foreground font-mono text-xs">{{ page.url }}</span>
            </div>
            <span class="shrink-0 font-semibold tabular-nums">{{ page.pageviews.toLocaleString() }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">Veri bulunamadı</p>
        <NuxtLink
          :to="`/dashboard/${siteId}/pages`"
          class="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Tümünü Gör <LucideArrowRight class="size-3" />
        </NuxtLink>
      </div>

      <!-- Devices -->
      <div class="rounded-xl border border-border bg-card p-5">
        <h2 class="text-sm font-semibold mb-4">Cihaz Dağılımı</h2>
        <div v-if="isLoadingDevices" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-9 rounded bg-muted animate-pulse" />
        </div>
        <div v-else-if="deviceTypes.length > 0" class="space-y-3">
          <div v-for="device in deviceTypes" :key="device.device" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="capitalize flex items-center gap-2">
                <LucideMonitor v-if="device.device === 'desktop'" class="size-3.5 text-muted-foreground" />
                <LucideSmartphone v-else-if="device.device === 'mobile'" class="size-3.5 text-muted-foreground" />
                <LucideTablet v-else class="size-3.5 text-muted-foreground" />
                {{ deviceLabel(device.device) }}
              </span>
              <span class="text-xs text-muted-foreground tabular-nums">
                {{ (device.percentage * 100).toFixed(1) }}%
              </span>
            </div>
            <div class="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full bg-foreground transition-all duration-700"
                :style="{ width: `${device.percentage * 100}%` }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">Veri bulunamadı</p>
        <NuxtLink
          :to="`/dashboard/${siteId}/devices`"
          class="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Tümünü Gör <LucideArrowRight class="size-3" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LucideUsers,
  LucideEye,
  LucideActivity,
  LucideClock,
  LucideArrowUpRight,
  LucideLayoutGrid,
  LucideFileText,
  LucideMonitor,
  LucideSmartphone,
  LucideTablet,
  LucideArrowRight,
} from 'lucide-vue-next'
import { useSiteStore } from '~/stores/site.store'
import { useReports } from '~/composables/useReports'
import MetricCard from '~/components/dashboard/MetricCard.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const siteId = computed(() => route.params.siteId as string)
const siteStore = useSiteStore()
const { getOverview, getTimeseries, getPages, getDevices } = useReports()

const dateRanges = [
  { label: 'Bugün', value: '0' },
  { label: '7G', value: '7' },
  { label: '30G', value: '30' },
  { label: '3A', value: '90' },
]
const granularities = [
  { label: 'Saat', value: 'hour' },
  { label: 'Gün', value: 'day' },
  { label: 'Hafta', value: 'week' },
]

const selectedRange = ref('30')
const granularity = ref<'hour' | 'day' | 'week' | 'month'>('day')

const overview = ref<any>(null)
const timeseries = ref<any[]>([])
const topPages = ref<any[]>([])
const deviceTypes = ref<any[]>([])

const isLoading = ref(true)
const isLoadingTimeseries = ref(true)
const isLoadingPages = ref(true)
const isLoadingDevices = ref(true)

function getDateRange(days: string) {
  const to = new Date()
  const from = new Date()
  if (days !== '0') from.setDate(from.getDate() - parseInt(days))
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(from), to: fmt(to) }
}

function getBarHeight(value: number) {
  const max = Math.max(...timeseries.value.map((t) => t.pageviews), 1)
  return Math.max((value / max) * 100, 2)
}

function deviceLabel(d: string) {
  if (d === 'desktop') return 'Masaüstü'
  if (d === 'mobile') return 'Mobil'
  return 'Tablet'
}

async function fetchData() {
  const { from, to } = getDateRange(selectedRange.value)
  const params = { siteId: siteId.value, from, to }

  isLoading.value = true
  isLoadingTimeseries.value = true
  isLoadingPages.value = true
  isLoadingDevices.value = true

  const [ovRes, tsRes, pgRes, devRes] = await Promise.allSettled([
    getOverview(params),
    getTimeseries({ ...params, granularity: granularity.value }),
    getPages({ ...params, limit: 5 }),
    getDevices(params),
  ])

  if (ovRes.status === 'fulfilled' && ovRes.value.success) overview.value = ovRes.value.data
  isLoading.value = false

  if (tsRes.status === 'fulfilled' && tsRes.value.success) timeseries.value = tsRes.value.data
  isLoadingTimeseries.value = false

  if (pgRes.status === 'fulfilled' && pgRes.value.success) topPages.value = pgRes.value.data
  isLoadingPages.value = false

  if (devRes.status === 'fulfilled' && devRes.value.success) deviceTypes.value = devRes.value.data.deviceTypes
  isLoadingDevices.value = false
}

function selectRange(val: string) {
  selectedRange.value = val
  fetchData()
}

watch(granularity, fetchData)

onMounted(async () => {
  if (siteStore.sites.length > 0) {
    siteStore.setActiveSiteById(siteId.value)
  }
  await fetchData()
})
</script>
