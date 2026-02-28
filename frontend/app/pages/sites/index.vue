<template>
  <div class="p-6 md:p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-lg font-semibold">Siteler</h1>
        <p class="text-muted-foreground text-sm mt-0.5">Web sitelerinizi yönetin</p>
      </div>
      <NuxtLink
        to="/sites/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
      >
        <LucidePlus class="size-4" />
        Yeni Site
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 rounded-lg bg-muted animate-pulse" />
    </div>

    <div v-else-if="sites.length === 0" class="text-center py-16 border border-dashed border-border rounded-xl">
      <LucideGlobe class="size-10 mx-auto text-muted-foreground mb-4" />
      <p class="font-semibold">Henüz site yok</p>
      <p class="text-muted-foreground text-sm mt-1 mb-6">Analitik toplamak için bir site ekleyin</p>
      <NuxtLink to="/sites/new" class="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90">
        <LucidePlus class="size-4" />Site Ekle
      </NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="site in sites"
        :key="site.siteId"
        class="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
      >
        <div class="flex items-center gap-4 min-w-0">
          <div class="size-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm shrink-0">
            {{ site.name[0]?.toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-sm">{{ site.name }}</p>
              <span
                :class="[
                  'text-xs px-1.5 py-0.5 rounded-full font-medium',
                  site.isVerified
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                ]"
              >
                {{ site.isVerified ? 'Doğrulandı' : 'Doğrulama Bekliyor' }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">{{ site.domain }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink
            :to="`/dashboard/${site.siteId}`"
            class="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            :to="`/sites/${site.siteId}/settings`"
            class="size-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <LucideSettings class="size-4" />
          </NuxtLink>
          <button
            class="size-8 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            @click="confirmDelete(site)"
          >
            <LucideTrash2 class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Dialog -->
    <div
      v-if="deleteTarget"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="deleteTarget = null"
    >
      <div class="bg-card border border-border rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h3 class="font-semibold text-lg mb-2">Siteyi Sil</h3>
        <p class="text-muted-foreground text-sm mb-6">
          <span class="font-semibold text-foreground">{{ deleteTarget.name }}</span> sitesini silmek istediğinize emin misiniz?
          Bu işlem geri alınamaz ve tüm analitik veriler silinir.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            class="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            @click="deleteTarget = null"
          >
            İptal
          </button>
          <button
            :disabled="isDeleting"
            class="px-4 py-2 text-sm bg-destructive text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            @click="handleDelete"
          >
            {{ isDeleting ? 'Siliniyor...' : 'Sil' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideGlobe, LucidePlus, LucideSettings, LucideTrash2 } from 'lucide-vue-next'
import { useSites } from '~/composables/useSites'

definePageMeta({ layout: 'default', middleware: 'auth' })

const { getSites, deleteSite } = useSites()

const sites = ref<any[]>([])
const isLoading = ref(true)
const deleteTarget = ref<any>(null)
const isDeleting = ref(false)

async function loadSites() {
  try {
    const res = await getSites()
    if (res.success) sites.value = res.data
  } finally {
    isLoading.value = false
  }
}

function confirmDelete(site: any) {
  deleteTarget.value = site
}

async function handleDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await deleteSite(deleteTarget.value.siteId)
    sites.value = sites.value.filter((s) => s.siteId !== deleteTarget.value.siteId)
    deleteTarget.value = null
  } finally {
    isDeleting.value = false
  }
}

onMounted(loadSites)
</script>
