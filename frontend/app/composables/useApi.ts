import { useAuthStore } from '~/stores/auth.store'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function getHeaders() {
    const headers: Record<string, string> = {}
    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return headers
  }

  async function apiFetch<T>(path: string, options: any = {}): Promise<T> {
    const url = `${config.public.apiBase}${path}`
    return await $fetch<T>(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    })
  }

  return { apiFetch, getHeaders }
}
