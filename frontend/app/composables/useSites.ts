export function useSites() {
  const { apiFetch } = useApi()

  async function getSites() {
    return await apiFetch<any>('/sites')
  }

  async function getSite(siteId: string) {
    return await apiFetch<any>(`/sites/${siteId}`)
  }

  async function createSite(data: { name: string; domain: string; timezone: string }) {
    return await apiFetch<any>('/sites', { method: 'POST', body: data })
  }

  async function updateSite(siteId: string, data: any) {
    return await apiFetch<any>(`/sites/${siteId}`, { method: 'PUT', body: data })
  }

  async function deleteSite(siteId: string) {
    return await apiFetch<any>(`/sites/${siteId}`, { method: 'DELETE' })
  }

  async function verifySite(siteId: string, method: 'dns' | 'meta') {
    return await apiFetch<any>(`/sites/${siteId}/verify`, { method: 'POST', body: { method } })
  }

  async function getSnippet(siteId: string) {
    return await apiFetch<any>(`/sites/${siteId}/snippet`)
  }

  return { getSites, getSite, createSite, updateSite, deleteSite, verifySite, getSnippet }
}
