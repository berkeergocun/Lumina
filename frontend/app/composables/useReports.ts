interface ReportParams {
  siteId: string
  from?: string
  to?: string
  timezone?: string
  granularity?: 'hour' | 'day' | 'week' | 'month'
  page?: number
  limit?: number
  eventName?: string
}

export function useReports() {
  const { apiFetch } = useApi()

  async function getOverview(params: ReportParams) {
    return await apiFetch<any>(`/reports/overview?${new URLSearchParams(params as any).toString()}`)
  }

  async function getTimeseries(params: ReportParams) {
    return await apiFetch<any>(`/reports/timeseries?${new URLSearchParams(params as any).toString()}`)
  }

  async function getPages(params: ReportParams) {
    return await apiFetch<any>(`/reports/pages?${new URLSearchParams(params as any).toString()}`)
  }

  async function getSources(params: ReportParams) {
    return await apiFetch<any>(`/reports/sources?${new URLSearchParams(params as any).toString()}`)
  }

  async function getGeo(params: ReportParams) {
    return await apiFetch<any>(`/reports/geo?${new URLSearchParams(params as any).toString()}`)
  }

  async function getDevices(params: ReportParams) {
    return await apiFetch<any>(`/reports/devices?${new URLSearchParams(params as any).toString()}`)
  }

  async function getEvents(params: ReportParams) {
    return await apiFetch<any>(`/reports/events?${new URLSearchParams(params as any).toString()}`)
  }

  async function getEventProperties(eventName: string, params: ReportParams) {
    return await apiFetch<any>(
      `/reports/events/${encodeURIComponent(eventName)}/properties?${new URLSearchParams(params as any).toString()}`
    )
  }

  return { getOverview, getTimeseries, getPages, getSources, getGeo, getDevices, getEvents, getEventProperties }
}
