import { defineStore } from 'pinia'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    sidebarCollapsed: false,
    theme: 'light',
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setTheme(theme: 'light' | 'dark' | 'system') {
      this.theme = theme
    },
  },
})
