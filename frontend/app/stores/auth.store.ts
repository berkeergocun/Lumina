import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'owner',
  },

  actions: {
    setAuth(data: { accessToken: string; refreshToken: string; user: User }) {
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      }
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      if (import.meta.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        this.accessToken = localStorage.getItem('accessToken')
        this.refreshToken = localStorage.getItem('refreshToken')
      }
    },
  },
})
