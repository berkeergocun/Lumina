<template>
  <div class="p-6 md:p-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-xl font-bold">Sayfalar</h1>
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          type="search"
          placeholder="URL ara..."
          class="px-3 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring w-48"
        />
        <button
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          @click="exportCSV"
        >
          <LucideDownload class="size-3.5" />CSV
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">URL</th>
              <th
                class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground"
                @click="sortBy('pageviews')"
              >G. Sayısı {{ sortField === 'pageviews' ? (sortAsc ? '↑' : '↓') : '' }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">B. Ziyaretçi</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bounce</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ort. Süre</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr v-for="i in 10" :key="i" class="border-b border-border/50">
                <td class="px-4 py-3"><div class="h-4 bg-muted rounded animate-pulse w-3/4" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-muted rounded animate-pulse w-12 ml-auto" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-muted rounded animate-pulse w-10 ml-auto" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-muted rounded animate-pulse w-10 ml-auto" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-muted rounded animate-pulse w-12 ml-auto" /></td>
              </tr>
            </template>
            <tr
              v-for="page in filteredPages"
              :key="page.url"
              class="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              @click="selectedPage = page"
            >
              <td class="px-4 py-3 font-mono text-xs text-muted-foreground max-w-xs truncate">{{ page.url }}</td>
              <td class="px-4 py-3 text-right font-semibold tabular-nums">{{ page.pageviews.toLocaleString() }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ page.visitors?.toLocaleString() ?? '—' }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ page.bounceRate ? `${(page.bounceRate * 100).toFixed(0)}%` : '—' }}</td>
              <td class="px-4 py-3 text-right text-muted-foreground tabular-nums">{{ formatDur(page.avgTimeOnPage) }}</td>
            </tr>
            <tr v-if="!isLoading && filteredPages.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-muted-foreground">Veri bulunamadı</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta.total > meta.limit" class="flex items-center justify-between px-4 py-3 border-t border-border">
        <p class="text-xs text-muted-foreground">
          {{ (meta.page - 1) * meta.limit + 1 }}–{{ Math.min(meta.page * meta.limit, meta.total) }} / {{ meta.total }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="meta.page <= 1"
            class="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
            @click="changePage(meta.page - 1)"
          >
            ←
          </button>
          <button
            :disabled="meta.page * meta.limit >= meta.total"
            class="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
            @click="changePage(meta.page + 1)"
          >
            →
          </button>
        </div>
      </div>
    </div>

    <!-- Page Detail Modal -->
    <div
      v-if="selectedPage"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="selectedPage = null"
    >
      <div class="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-xl">
        <div class="flex items-start justify-between mb-4">
          <h3 class="font-semibold text-sm font-mono break-all">{{ selectedPage.url }}</h3>
          <button class="text-muted-foreground hover:text-foreground ml-4 shrink-0" @click="selectedPage = null">
            <LucideX class="size-4" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 rounded-lg bg-muted text-center">
            <p class="text-2xl font-bold">{{ selectedPage.pageviews?.toLocaleString() }}</p>
            <p class="text-xs text-muted-foreground mt-1">Görüntülenme</p>
          </div>
          <div class="p-3 rounded-lg bg-muted text-center">
            <p class="text-2xl font-bold">{{ selectedPage.visitors?.toLocaleString() ?? '—' }}</p>
            <p class="text-xs text-muted-foreground mt-1">Benzersiz Ziyaretçi</p>
          </div>
          <div class="p-3 rounded-lg bg-muted text-center">
            <p class="text-2xl font-bold">{{ selectedPage.bounceRate ? `${(selectedPage.bounceRate * 100).toFixed(0)}%` : '—' }}</p>
            <p class="text-xs text-muted-foreground mt-1">Bounce Rate</p>
          </div>
          <div class="p-3 rounded-lg bg-muted text-center">
            <p class="text-2xl font-bold">{{ formatDur(selectedPage.avgTimeOnPage) }}</p>
            <p class="text-xs text-muted-foreground mt-1">Ort. Süre</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideDownload, LucideX } from 'lucide-vue-next'
import { useReports } from '~/composables/useReports'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getPages } = useReports()
const siteId = computed(() => route.params.siteId as string)

const pages = ref<any[]>([])
const isLoading = ref(true)
const search = ref('')
const sortField = ref('pageviews')
const sortAsc = ref(false)
const selectedPage = ref<any>(null)
const meta = ref({ page: 1, limit: 20, total: 0 })

const filteredPages = computed(() => {
  let list = pages.value
  if (search.value) list = list.filter((p) => p.url.includes(search.value))
  return list
})

function sortBy(field: string) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = false }
  fetchPages()
}

function formatDur(s?: number) {
  if (!s) return '—'
  return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`
}

function exportCSV() {
  const rows = [['URL', 'Görüntülenme', 'Ziyaretçi', 'Bounce', 'Süre']]
  pages.value.forEach((p) => rows.push([p.url, p.pageviews, p.visitors, p.bounceRate, p.avgTimeOnPage]))
  const csv = rows.map((r) => r.join(',')).join('\n')
  const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'pages.csv'; a.click()
}

async function fetchPages(page = 1) {
  isLoading.value = true
  try {
    const res = await getPages({ siteId: siteId.value, page, limit: 20 })
    if (res.success) {
      pages.value = res.data
      meta.value = res.meta ?? meta.value
    }
  } finally {
    isLoading.value = false
  }
}

function changePage(page: number) {
  meta.value.page = page
  fetchPages(page)
}

onMounted(() => fetchPages())
</script>
