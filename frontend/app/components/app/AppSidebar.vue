<template>
  <!-- Desktop Sidebar -->
  <aside
    :class="[
      'hidden md:flex flex-col h-screen bg-card border-r border-border shrink-0 overflow-hidden',
      'sidebar-transition',
      collapsed ? 'w-[60px]' : 'w-[240px]',
    ]"
  >
    <!-- Logo -->
    <div
      :class="[
        'flex items-center border-b border-border shrink-0 h-14',
        collapsed ? 'justify-center px-0' : 'gap-2.5 px-4',
      ]"
    >
      <div class="size-7 bg-foreground rounded-md flex items-center justify-center shrink-0">
        <span class="text-background text-xs font-black tracking-tighter">L</span>
      </div>
      <Transition name="label-fade">
        <span v-if="!collapsed" class="font-semibold text-[15px] tracking-tight">Lumina</span>
      </Transition>
    </div>

    <!-- Site Selector -->
    <div :class="['border-b border-border shrink-0', collapsed ? 'p-2' : 'p-3']">
      <template v-if="!collapsed">
        <select
          v-model="activeSiteId"
          class="w-full text-sm bg-background rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer text-foreground"
          @change="onSiteChange"
        >
          <option value="" disabled class="text-muted-foreground">Site seçin...</option>
          <option v-for="site in siteStore.sites" :key="site.siteId" :value="site.siteId">
            {{ site.name }}
          </option>
        </select>
      </template>
      <template v-else>
        <AppTooltip text="Site Seç" side="right">
          <button class="w-full flex items-center justify-center size-9 rounded-md hover:bg-muted transition-colors text-muted-foreground">
            <LucideLayoutGrid class="size-4" />
          </button>
        </AppTooltip>
      </template>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
      <template v-for="item in navItems" :key="item.path">
        <AppTooltip :text="item.label" :side="'right'" :disabled="!collapsed">
          <NuxtLink
            :to="item.path"
            :class="[
              'flex items-center rounded-md text-sm font-medium transition-all group w-full',
              collapsed ? 'justify-center size-9 mx-auto' : 'gap-3 px-3 py-2',
              isActive(item.path)
                ? 'bg-foreground/90 text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            ]"
          >
            <component :is="item.icon" :class="['shrink-0', collapsed ? 'size-4' : 'size-4']" />
            <Transition name="label-fade">
              <span v-if="!collapsed" class="truncate leading-none">{{ item.label }}</span>
            </Transition>
          </NuxtLink>
        </AppTooltip>
      </template>
    </nav>

    <!-- Bottom -->
    <div :class="['border-t border-border py-2 px-2 space-y-0.5']">
      <AppTooltip text="Ayarlar" side="right" :disabled="!collapsed">
        <NuxtLink
          to="/settings/profile"
          :class="[
            'flex items-center rounded-md text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted w-full',
            collapsed ? 'justify-center size-9 mx-auto' : 'gap-3 px-3 py-2',
          ]"
        >
          <LucideSettings class="size-4 shrink-0" />
          <Transition name="label-fade">
            <span v-if="!collapsed" class="truncate">Ayarlar</span>
          </Transition>
        </NuxtLink>
      </AppTooltip>

      <AppTooltip text="Çıkış Yap" side="right" :disabled="!collapsed">
        <button
          :class="[
            'flex items-center rounded-md text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted w-full',
            collapsed ? 'justify-center size-9 mx-auto' : 'gap-3 px-3 py-2',
          ]"
          @click="handleLogout"
        >
          <LucideLogOut class="size-4 shrink-0" />
          <Transition name="label-fade">
            <span v-if="!collapsed" class="truncate">Çıkış Yap</span>
          </Transition>
        </button>
      </AppTooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LucideLayoutDashboard,
  LucideActivity,
  LucideFileText,
  LucideGlobe2,
  LucideMonitor,
  LucideZap,
  LucideMousePointerClick,
  LucideDownload,
  LucideSettings,
  LucideLogOut,
  LucideLayoutGrid,
} from 'lucide-vue-next'
import { useSiteStore } from '~/stores/site.store'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{ collapsed: boolean }>()

const route = useRoute()
const siteStore = useSiteStore()
const { logout } = useAuth()

const activeSiteId = ref(siteStore.activeSiteId ?? '')

// Sync with store
watch(() => siteStore.activeSiteId, (id) => {
  activeSiteId.value = id ?? ''
})

const siteId = computed(() => siteStore.activeSiteId)

const navItems = computed(() => {
  if (!siteId.value) {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: LucideLayoutDashboard },
    ]
  }
  return [
    { path: `/dashboard/${siteId.value}`, label: 'Genel Bakış', icon: LucideLayoutDashboard },
    { path: `/dashboard/${siteId.value}/realtime`, label: 'Gerçek Zamanlı', icon: LucideActivity },
    { path: `/dashboard/${siteId.value}/pages`, label: 'Sayfalar', icon: LucideFileText },
    { path: `/dashboard/${siteId.value}/sources`, label: 'Kaynaklar', icon: LucideGlobe2 },
    { path: `/dashboard/${siteId.value}/geo`, label: 'Coğrafi', icon: LucideGlobe2 },
    { path: `/dashboard/${siteId.value}/devices`, label: 'Cihazlar', icon: LucideMonitor },
    { path: `/dashboard/${siteId.value}/events`, label: 'Etkinlikler', icon: LucideMousePointerClick },
    { path: `/dashboard/${siteId.value}/export`, label: 'Dışa Aktar', icon: LucideDownload },
  ]
})

function isActive(path: string) {
  if (path === `/dashboard/${siteId.value}`) {
    return route.path === path
  }
  return route.path.startsWith(path)
}

function onSiteChange() {
  const site = siteStore.sites.find(s => s.siteId === activeSiteId.value)
  if (site) {
    siteStore.setActiveSite(site)
    navigateTo(`/dashboard/${activeSiteId.value}`)
  }
}

async function handleLogout() {
  await logout()
}
</script>

<style scoped>
.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.label-fade-enter-from {
  opacity: 0;
  transform: translateX(-4px);
}
.label-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
