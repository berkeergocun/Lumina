<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0',
        uiStore.sidebarCollapsed ? 'w-16' : 'w-60',
        'hidden md:flex'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-border shrink-0">
        <div class="size-8 bg-foreground rounded-lg flex items-center justify-center shrink-0">
          <span class="text-background text-sm font-black">L</span>
        </div>
        <span v-if="!uiStore.sidebarCollapsed" class="font-bold text-lg tracking-tight truncate">Lumina</span>
      </div>

      <!-- Site Selector -->
      <div v-if="!uiStore.sidebarCollapsed" class="px-3 py-3 border-b border-border">
        <select
          v-model="activeSiteId"
          class="w-full text-sm bg-muted rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          @change="onSiteChange"
        >
          <option value="" disabled>Site seçin...</option>
          <option v-for="site in siteStore.sites" :key="site.siteId" :value="site.siteId">
            {{ site.name }}
          </option>
        </select>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <template v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(item.path)
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            ]"
          >
            <component :is="item.icon" class="size-4 shrink-0" />
            <span v-if="!uiStore.sidebarCollapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Bottom Nav -->
      <div class="border-t border-border px-2 py-3 space-y-1">
        <NuxtLink
          to="/settings/profile"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-muted'
          ]"
        >
          <LucideSettings class="size-4 shrink-0" />
          <span v-if="!uiStore.sidebarCollapsed">Ayarlar</span>
        </NuxtLink>
        <button
          class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          @click="handleLogout"
        >
          <LucideLogOut class="size-4 shrink-0" />
          <span v-if="!uiStore.sidebarCollapsed">Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="flex items-center gap-4 px-4 md:px-6 py-4 border-b border-border bg-card shrink-0">
        <button
          class="hidden md:flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
          @click="uiStore.toggleSidebar()"
        >
          <LucideMenu class="size-4" />
        </button>

        <!-- Mobile logo -->
        <div class="flex md:hidden items-center gap-2">
          <div class="size-7 bg-foreground rounded-md flex items-center justify-center">
            <span class="text-background text-xs font-black">L</span>
          </div>
          <span class="font-bold">Lumina</span>
        </div>

        <div class="flex-1" />

        <!-- Header Right -->
        <div class="flex items-center gap-2">
          <button
            class="flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            @click="toggleTheme"
          >
            <LucideSun v-if="colorMode.value === 'dark'" class="size-4" />
            <LucideMoon v-else class="size-4" />
          </button>

          <div class="flex items-center gap-2 pl-2 border-l border-border">
            <div class="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
              {{ userInitial }}
            </div>
            <span v-if="authStore.user" class="text-sm font-medium hidden sm:block">{{ authStore.user.name }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50">
      <div class="flex items-center justify-around px-2 py-2">
        <template v-for="item in mobileNavItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :class="[
              'flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors',
              isActive(item.path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <component :is="item.icon" class="size-5" />
            <span class="text-xs">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  LucideLayoutDashboard,
  LucideZap,
  LucideFileText,
  LucideGlobe2,
  LucideMonitor,
  LucideStar,
  LucideDownload,
  LucideGlobe,
  LucideSettings,
  LucideLogOut,
  LucideMenu,
  LucideSun,
  LucideMoon,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth.store'
import { useSiteStore } from '~/stores/site.store'
import { useUIStore } from '~/stores/ui.store'
import { useAuth } from '~/composables/useAuth'

defineOptions({ name: 'DefaultLayout' })

const route = useRoute()
const colorMode = useColorMode()
const authStore = useAuthStore()
const siteStore = useSiteStore()
const uiStore = useUIStore()
const { logout } = useAuth()

const activeSiteId = ref(siteStore.activeSiteId ?? '')

const userInitial = computed(() => authStore.user?.name?.[0]?.toUpperCase() ?? 'U')

const currentSiteId = computed(() => route.params.siteId as string | undefined)

const navItems = computed(() => {
  const base = currentSiteId.value || siteStore.activeSiteId
  if (!base) return []
  return [
    { label: 'Genel Bakış', path: `/dashboard/${base}`, icon: LucideLayoutDashboard },
    { label: 'Gerçek Zamanlı', path: `/dashboard/${base}/realtime`, icon: LucideZap },
    { label: 'Sayfalar', path: `/dashboard/${base}/pages`, icon: LucideFileText },
    { label: 'Kaynaklar', path: `/dashboard/${base}/sources`, icon: LucideGlobe2 },
    { label: 'Coğrafi', path: `/dashboard/${base}/geo`, icon: LucideGlobe },
    { label: 'Cihazlar', path: `/dashboard/${base}/devices`, icon: LucideMonitor },
    { label: 'Etkinlikler', path: `/dashboard/${base}/events`, icon: LucideStar },
    { label: 'Dışa Aktar', path: `/dashboard/${base}/export`, icon: LucideDownload },
  ]
})

const mobileNavItems = computed(() => {
  const base = currentSiteId.value || siteStore.activeSiteId
  if (!base) return []
  return [
    { label: 'Genel', path: `/dashboard/${base}`, icon: LucideLayoutDashboard },
    { label: 'Canlı', path: `/dashboard/${base}/realtime`, icon: LucideZap },
    { label: 'Sayfalar', path: `/dashboard/${base}/pages`, icon: LucideFileText },
    { label: 'Cihazlar', path: `/dashboard/${base}/devices`, icon: LucideMonitor },
    { label: 'Ayarlar', path: '/settings/profile', icon: LucideSettings },
  ]
})

function isActive(path: string) {
  if (path === `/dashboard/${currentSiteId.value}` || path === `/dashboard/${siteStore.activeSiteId}`) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

function onSiteChange() {
  if (activeSiteId.value) {
    siteStore.setActiveSiteById(activeSiteId.value)
    navigateTo(`/dashboard/${activeSiteId.value}`)
  }
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function handleLogout() {
  await logout()
}

// Load sites on mount
onMounted(async () => {
  authStore.loadFromStorage()
  if (authStore.isAuthenticated && siteStore.sites.length === 0) {
    try {
      const { apiFetch } = useApi()
      const res = await apiFetch<any>('/sites')
      if (res.success) {
        siteStore.setSites(res.data)
        if (!siteStore.activeSite && res.data.length > 0) {
          const savedId = localStorage.getItem('activeSiteId')
          const found = res.data.find((s: any) => s.siteId === savedId) ?? res.data[0]
          siteStore.setActiveSite(found)
          activeSiteId.value = found.siteId
        } else if (siteStore.activeSite) {
          activeSiteId.value = siteStore.activeSite.siteId
        }
      }
    } catch (e) {
      // ignore
    }
  }
})
</script>
