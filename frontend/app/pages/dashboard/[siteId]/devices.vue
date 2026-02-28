<template>
  <div class="p-6 md:p-8">
    <h1 class="text-xl font-bold mb-8">Cihaz ve Tarayıcı</h1>

    <div v-if="isLoading" class="grid md:grid-cols-2 gap-6">
      <div v-for="i in 4" :key="i" class="h-48 rounded-xl bg-muted animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <div class="grid md:grid-cols-3 gap-4">
        <!-- Device Types -->
        <div class="rounded-xl border border-border bg-card p-5">
          <h2 class="text-sm font-semibold mb-4">Cihaz Türü</h2>
          <div class="space-y-3">
            <div v-for="item in devices?.deviceTypes ?? []" :key="item.device" class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2">
                  <LucideMonitor v-if="item.device === 'desktop'" class="size-3.5 text-muted-foreground" />
                  <LucideSmartphone v-else-if="item.device === 'mobile'" class="size-3.5 text-muted-foreground" />
                  <LucideTablet v-else class="size-3.5 text-muted-foreground" />
                  {{ { desktop: 'Masaüstü', mobile: 'Mobil', tablet: 'Tablet' }[item.device] ?? item.device }}
                </span>
                <span class="text-xs text-muted-foreground tabular-nums">{{ (item.percentage * 100).toFixed(1) }}%</span>
              </div>
              <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                <div class="h-full rounded-full bg-foreground" :style="{ width: `${item.percentage * 100}%` }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Browsers -->
        <div class="rounded-xl border border-border bg-card p-5">
          <h2 class="text-sm font-semibold mb-4">Tarayıcı</h2>
          <div class="space-y-3">
            <div v-for="item in devices?.browsers ?? []" :key="item.browser" class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <span>{{ item.browser }}</span>
                <span class="text-xs text-muted-foreground tabular-nums">{{ (item.percentage * 100).toFixed(1) }}%</span>
              </div>
              <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                <div class="h-full rounded-full bg-foreground" :style="{ width: `${item.percentage * 100}%` }" />
              </div>
            </div>
          </div>
        </div>

        <!-- OS -->
        <div class="rounded-xl border border-border bg-card p-5">
          <h2 class="text-sm font-semibold mb-4">İşletim Sistemi</h2>
          <div class="space-y-3">
            <div v-for="item in devices?.operatingSystems ?? []" :key="item.os" class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <span>{{ item.os }}</span>
                <span class="text-xs text-muted-foreground tabular-nums">{{ (item.percentage * 100).toFixed(1) }}%</span>
              </div>
              <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                <div class="h-full rounded-full bg-foreground" :style="{ width: `${item.percentage * 100}%` }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Screen Resolutions -->
      <div v-if="devices?.screenResolutions?.length" class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="px-4 py-3 border-b border-border">
          <h2 class="text-sm font-semibold">Ekran Çözünürlüğü</h2>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Çözünürlük</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ziyaretçi</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">%</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="res in devices.screenResolutions"
              :key="res.resolution"
              class="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3 font-mono text-xs">{{ res.resolution }}</td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ res.visitors?.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ (res.percentage * 100).toFixed(1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideMonitor, LucideSmartphone, LucideTablet } from 'lucide-vue-next'
import { useReports } from '~/composables/useReports'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getDevices } = useReports()
const siteId = computed(() => route.params.siteId as string)

const devices = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await getDevices({ siteId: siteId.value })
    if (res.success) devices.value = res.data
  } finally {
    isLoading.value = false
  }
})
</script>
