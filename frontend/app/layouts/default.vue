<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'hidden md:flex flex-col h-screen bg-card border-r border-border shrink-0 overflow-hidden sidebar-transition',
        uiStore.sidebarCollapsed ? 'w-[60px]' : 'w-[240px]',
      ]"
    >
      <!-- Logo -->
      <div
        :class="[
          'flex items-center border-b border-border shrink-0 h-14',
          uiStore.sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-4',
        ]"
      >
        <div class="size-7 bg-foreground rounded-md flex items-center justify-center shrink-0">
          <span class="text-background text-xs font-black tracking-tighter">L</span>
        </div>
        <span v-if="!uiStore.sidebarCollapsed" class="font-semibold text-[15px] tracking-tight">Lumina</span>
      </div>

      <!-- Site Selector -->
      <div :class="['border-b border-border shrink-0', uiStore.sidebarCollapsed ? 'p-2' : 'p-3']">
        <template v-if="!uiStore.sidebarCollapsed">
          <div class="relative">
            <select
              v-model="activeSiteId"
              class="w-full text-xs bg-muted/50 rounded-md px-3 py-2 border border-border/60 focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer text-foreground pr-7"
              @change="onSiteChange"
            >
              <option value="" disabled>Site seçin...</option>
              <option v-for="site in siteStore.sites" :key="site.siteId" :value="site.siteId">
                {{ site.name }}
              </option>
            </select>
            <LucideChevronsUpDown class="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          </div>
        </template>
        <template v-else>
          <NuxtLink
            to="/dashboard"
            class="flex items-center justify-center size-9 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            title="Sites"
          >
            <LucideLayoutGrid class="size-4" />
          </NuxtLink>
        </template>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <template v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :title="uiStore.sidebarCollapsed ? item.label : ''"
            :class="[
              'flex items-center rounded-md text-sm font-medium transition-all',
              uiStore.sidebarCollapsed ? 'justify-center size-9 mx-auto' : 'gap-3 px-3 py-2',
              isActive(item.path)
                ? 'bg-foreground/90 text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            ]"
          >
            <component :is="item.icon" class="size-4 shrink-0" />
            <span v-if="!uiStore.sidebarCollapsed" class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Bottom -->
      <div class="border-t border-border py-2 px-2 space-y-0.5">
        <NuxtLink
          to="/settings/profile"
          :title="uiStore.sidebarCollapsed ? 'Ayarlar' : ''"
          :class="[
            'flex items-center rounded-md text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-muted',
            uiStore.sidebarCollapsed ? 'justify-center size-9 mx-auto' : 'gap-3 px-3 py-2',
          ]"
        >
          <LucideSettings class="size-4 shrink-0" />
          <span v-if="!uiStore.sidebarCollapsed">Ayarlar</span>
        </NuxtLink>
        <button
          :title="uiStore.sidebarCollapsed ? 'Çıkış Yap' : ''"
          :class="[
            'flex items-center rounded-md text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-muted w-full',
            uiStore.sidebarCollapsed ? 'justify-center size-9 mx-auto' : 'gap-3 px-3 py-2',
          ]"
          @click="handleLogout"
        >
          <LucideLogOut class="size-4 shrink-0" />
          <span v-if="!uiStore.sidebarCollapsed">Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="flex items-center h-14 px-4 border-b border-border bg-card shrink-0 gap-3">
        <button
          class="hidden md:flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          @click="uiStore.toggleSidebar()"
        >
          <LucidePanelLeft class="size-4" />
        </button>
        <div class="flex md:hidden items-center gap-2">
          <div class="size-7 bg-foreground rounded-md flex items-center justify-center">
            <span class="text-background text-xs font-black">L</span>
          </div>
          <span class="font-semibold text-sm">Lumina</span>
        </div>
        <div class="flex-1" />
        <div class="flex items-center gap-1.5">
          <button
            class="flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            @click="toggleTheme"
          >
            <LucideSun v-if="colorMode.value === 'dark'" class="size-4" />
            <LucideMoon v-else class="size-4" />
          </button>
          <div class="h-5 w-px bg-border mx-1" />
          <div class="flex items-center gap-2.5">
            <div class="size-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold leading-none">
              {{ userInitial }}
            </div>
            <span class="text-sm font-medium hidden sm:block">{{ authStore.user?.name }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto pb-14 md:pb-0">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav v-if="mobileNavItems.length" class="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50">
      <div class="flex items-stretch">
        <template v-for="item in mobileNavItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            :class="[
              'flex flex-col items-center justify-center gap-1 py-2.5 flex-1 transition-colors',
              isActive(item.path) ? 'text-foreground' : 'text-muted-foreground',
            ]"
          >
            <component :is="item.icon" class="size-5" />
            <span class="text-[10px] font-medium">{{ item.label }}</span>
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
  LucideMousePointerClick,
  LucideDownload,
  LucideSettings,
  LucideLogOut,
  LucideSun,
  LucideMoon,
  LucidePanelLeft,
  LucideChevronsUpDown,
  LucideLayoutGrid,
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

watch(() => siteStore.activeSiteId, (id) => {
  activeSiteId.value = id ?? ''
})

const userInitial = computed(() => authStore.user?.name?.[0]?.toUpperCase() ?? 'U')
const currentSiteId = computed(() => (route.params.siteId as string) || siteStore.activeSiteId || '')

const navItems = computed(() => {
  const base = currentSiteId.value
  if (!base) return [{ label: 'Dashboard', path: '/dashboard', icon: LucideLayoutDashboard }]
  return [
    { label: 'Genel Bakış', path: `/dashboard/${base}`, icon: LucideLayoutDashboard },
    { label: 'Gerçek Zamanlı', path: `/dashboard/${base}/realtime`, icon: LucideZap },
    { label: 'Sayfalar', path: `/dashboard/${base}/pages`, icon: LucideFileText },
    { label: 'Kaynaklar', path: `/dashboard/${base}/sources`, icon: LucideGlobe2 },
    { label: 'Coğrafi', path: `/dashboard/${base}/geo`, icon: LucideGlobe2 },
    { label: 'Cihazlar', path: `/dashboard/${base}/devices`, icon: LucideMonitor },
    { label: 'Etkinlikler', path: `/dashboard/${base}/events`, icon: LucideMousePointerClick },
    { label: 'Dışa Aktar', path: `/dashboard/${base}/export`, icon: LucideDownload },
  ]
})

const mobileNavItems = computed(() => {
  const base = currentSiteId.value
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
  if (path === `/dashboard/${currentSiteId.value}` || path === '/dashboard') return route.path === path
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

onMounted(async () => {
  authStore.loadFromStorage()
  if (authStore.isAuthenticated && siteStore.sites.length === 0) {
    try {
      const { apiFetch } = useApi()
      const res = await apiFetch<any>('/sites')
      if (res.success) {
        siteStore.setSites(res.data)
        if (!siteStore.activeSite && res.data.length > 0) {
          const savedId = import.meta.client ? localStorage.getItem('activeSiteId') : null
          const found = res.data.find((s: any) => s.siteId === savedId) ?? res.data[0]
          siteStore.setActiveSite(found)
          activeSiteId.value = found.siteId
        } else if (siteStore.activeSite) {
          activeSiteId.value = siteStore.activeSite.siteId
        }
      }
    } catch {}
  }
})
</script>
