<template>
  <div class="p-6 md:p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground text-sm mt-1">Analiz etmek istediğiniz siteyi seçin</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-28 rounded-lg bg-muted animate-pulse" />
    </div>

    <!-- No sites -->
    <div v-else-if="sites.length === 0" class="text-center py-16 border border-dashed border-border rounded-xl">
      <LucideGlobe class="size-10 mx-auto text-muted-foreground mb-4" />
      <p class="font-semibold text-lg">Henüz site eklenmemiş</p>
      <p class="text-muted-foreground text-sm mt-1 mb-6">Analitik toplamaya başlamak için bir site ekleyin</p>
      <NuxtLink
        to="/sites/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
      >
        <LucidePlus class="size-4" />
        Site Ekle
      </NuxtLink>
    </div>

    <!-- Sites grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="site in sites"
        :key="site.siteId"
        :to="`/dashboard/${site.siteId}`"
        class="group block p-5 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="size-9 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
            {{ site.name[0]?.toUpperCase() }}
          </div>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full font-medium',
              site.isVerified
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            ]"
          >
            {{ site.isVerified ? 'Doğrulandı' : 'Bekliyor' }}
          </span>
        </div>
        <p class="font-semibold text-sm mb-0.5 group-hover:text-foreground transition-colors">{{ site.name }}</p>
        <p class="text-xs text-muted-foreground truncate">{{ site.domain }}</p>
      </NuxtLink>

      <!-- Add site card -->
      <NuxtLink
        to="/sites/new"
        class="flex flex-col items-center justify-center gap-2 p-5 rounded-lg border border-dashed border-border hover:border-foreground/30 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
      >
        <LucidePlus class="size-6" />
        <span class="text-sm font-medium">Yeni Site Ekle</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideGlobe, LucidePlus } from 'lucide-vue-next'
import { useSites } from '~/composables/useSites'
import { useSiteStore } from '~/stores/site.store'

definePageMeta({ layout: 'default', middleware: 'auth' })

const siteStore = useSiteStore()
const { getSites } = useSites()

const sites = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await getSites()
    if (res.success) {
      sites.value = res.data
      siteStore.setSites(res.data)
    }
  } catch (err) {
    // Handle error
  } finally {
    isLoading.value = false
  }
})
</script>
