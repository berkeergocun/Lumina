import { defineStore } from 'pinia'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    sidebarCollapsed: false,
    theme: 'dark',
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebarCollapsed(val: boolean) {
      this.sidebarCollapsed = val
    },
    setTheme(theme: 'light' | 'dark' | 'system') {
      this.theme = theme
    },
  },
})
