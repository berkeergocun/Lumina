export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
