import { defineStore } from 'pinia'

interface Site {
  siteId: string
  name: string
  domain: string
  timezone: string
  isVerified: boolean
  createdAt?: string
}

interface SiteState {
  sites: Site[]
  activeSite: Site | null
  isLoading: boolean
}

export const useSiteStore = defineStore('site', {
  state: (): SiteState => ({
    sites: [],
    activeSite: null,
    isLoading: false,
  }),

  getters: {
    activeSiteId: (state) => state.activeSite?.siteId ?? null,
    verifiedSites: (state) => state.sites.filter((s) => s.isVerified),
  },

  actions: {
    setSites(sites: Site[]) {
      this.sites = sites
    },

    setActiveSite(site: Site | null) {
      this.activeSite = site
      if (site && import.meta.client) {
        localStorage.setItem('activeSiteId', site.siteId)
      }
    },

    setActiveSiteById(siteId: string) {
      const found = this.sites.find((s) => s.siteId === siteId)
      if (found) this.setActiveSite(found)
    },
  },
})
