<template>
  <header class="flex items-center h-14 px-4 border-b border-border bg-card shrink-0 gap-3">
    <!-- Sidebar toggle -->
    <button
      class="hidden md:flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      @click="$emit('toggle-sidebar')"
    >
      <LucidePanelLeft class="size-4" />
    </button>

    <!-- Mobile logo -->
    <div class="flex md:hidden items-center gap-2">
      <div class="size-7 bg-foreground rounded-md flex items-center justify-center">
        <span class="text-background text-xs font-black">L</span>
      </div>
      <span class="font-semibold text-sm">Lumina</span>
    </div>

    <!-- Breadcrumb / Page title -->
    <div v-if="title" class="hidden md:flex items-center gap-2 text-sm">
      <span class="text-muted-foreground">{{ title }}</span>
    </div>

    <div class="flex-1" />

    <!-- Right side -->
    <div class="flex items-center gap-2">
      <!-- Sites link (mobile) -->
      <NuxtLink
        to="/dashboard"
        class="flex md:hidden items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground"
      >
        <LucideLayoutGrid class="size-4" />
      </NuxtLink>

      <!-- Theme toggle -->
      <button
        class="flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        @click="toggleTheme"
      >
        <LucideSun v-if="colorMode.value === 'dark'" class="size-4" />
        <LucideMoon v-else class="size-4" />
      </button>

      <!-- Divider -->
      <div class="h-5 w-px bg-border mx-1" />

      <!-- User -->
      <div class="flex items-center gap-2.5">
        <div class="size-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
          {{ userInitial }}
        </div>
        <span class="text-sm font-medium leading-none hidden sm:block">{{ authStore.user?.name }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  LucidePanelLeft,
  LucideSun,
  LucideMoon,
  LucideLayoutGrid,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth.store'

defineProps<{ title?: string }>()
defineEmits<{ 'toggle-sidebar': [] }>()

const colorMode = useColorMode()
const authStore = useAuthStore()

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0)?.toUpperCase() ?? '?'
})

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
