import { useAuthStore } from '~/stores/auth.store'

export function useAuth() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  async function login(email: string, password: string) {
    const data = await $fetch<any>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })
    if (data.success) {
      authStore.setAuth(data.data)
      await router.push('/dashboard')
    }
    return data
  }

  async function register(name: string, email: string, password: string) {
    const data = await $fetch<any>(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      body: { name, email, password },
    })
    return data
  }

  async function logout() {
    try {
      if (authStore.refreshToken) {
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          body: { refreshToken: authStore.refreshToken },
          headers: { Authorization: `Bearer ${authStore.accessToken}` },
        })
      }
    } finally {
      authStore.clearAuth()
      await router.push('/login')
    }
  }

  async function forgotPassword(email: string) {
    return await $fetch<any>(`${config.public.apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: { email },
    })
  }

  async function resetPassword(token: string, password: string) {
    return await $fetch<any>(`${config.public.apiBase}/auth/reset-password`, {
      method: 'POST',
      body: { token, password },
    })
  }

  async function refresh() {
    if (!authStore.refreshToken) return false
    try {
      const data = await $fetch<any>(`${config.public.apiBase}/auth/refresh`, {
        method: 'POST',
        body: { refreshToken: authStore.refreshToken },
      })
      if (data.success) {
        authStore.setAuth({ ...data.data, user: authStore.user! })
        return true
      }
    } catch {
      authStore.clearAuth()
    }
    return false
  }

  return { login, register, logout, forgotPassword, resetPassword, refresh }
}
