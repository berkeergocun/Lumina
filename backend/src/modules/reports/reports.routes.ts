import Elysia, { t } from 'elysia'
import { requireAuth } from '../auth/auth.middleware.ts'
import { cacheGet, cacheSet, buildCacheHash } from '../../shared/cache.ts'
import { getOverview } from './overview.service.ts'
import { getTimeseries } from './timeseries.service.ts'
import { getPages } from './pages.service.ts'
import { getSources, getReferrers } from './sources.service.ts'
import { getGeo } from './geo.service.ts'
import { getDevices } from './devices.service.ts'
import { getCustomEvents, getEventProperties } from './events.service.ts'
import { env } from '../../config/env.ts'

// Sorgu şeması — tüm rapor endpoint'leri için ortak
const ReportQuery = t.Object({
  siteId: t.String({ minLength: 12, maxLength: 12 }),
  from: t.String({ format: 'date-time' }),
  to: t.String({ format: 'date-time' }),
})

const PaginatedQuery = t.Object({
  siteId: t.String({ minLength: 12, maxLength: 12 }),
  from: t.String({ format: 'date-time' }),
  to: t.String({ format: 'date-time' }),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 500, default: 50 })),
  offset: t.Optional(t.Numeric({ minimum: 0, default: 0 })),
})

const TimeseriesQuery = t.Object({
  siteId: t.String({ minLength: 12, maxLength: 12 }),
  from: t.String({ format: 'date-time' }),
  to: t.String({ format: 'date-time' }),
  granularity: t.Optional(
    t.Union([t.Literal('hour'), t.Literal('day'), t.Literal('week'), t.Literal('month')])
  ),
})

// Önbellekli rapor yardımcısı
async function cachedReport<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(cacheKey)
  if (cached) return cached
  const data = await fetchFn()
  await cacheSet(cacheKey, data, env.REPORT_CACHE_TTL)
  return data
}

export const reportsRoutes = new Elysia({ prefix: '/reports', tags: ['Reports'] })
  .use(requireAuth())

  // GET /reports/overview
  .get(
    '/overview',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
      }
      const cacheKey = `cache:report:${query.siteId}:${buildCacheHash({ ...query, type: 'overview' })}`
      try {
        const data = await cachedReport(cacheKey, () => getOverview(filters))
        return { success: true, data }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: ReportQuery,
      detail: { summary: 'Genel bakış metrikleri' },
    }
  )

  // GET /reports/timeseries
  .get(
    '/timeseries',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
        granularity: query.granularity as any,
      }
      const cacheKey = `cache:report:${query.siteId}:${buildCacheHash({ ...query, type: 'timeseries' })}`
      try {
        const data = await cachedReport(cacheKey, () => getTimeseries(filters))
        return { success: true, data }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: TimeseriesQuery,
      detail: { summary: 'Zaman serisi verileri' },
    }
  )

  // GET /reports/pages
  .get(
    '/pages',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
        limit: query.limit ?? 50,
        offset: query.offset ?? 0,
      }
      try {
        const data = await getPages(filters)
        return {
          success: true,
          data: data.pages,
          meta: { total: data.total, limit: filters.limit, offset: filters.offset },
        }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: PaginatedQuery,
      detail: { summary: 'Sayfa analizi' },
    }
  )

  // GET /reports/sources
  .get(
    '/sources',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
      }
      const cacheKey = `cache:report:${query.siteId}:${buildCacheHash({ ...query, type: 'sources' })}`
      try {
        const data = await cachedReport(cacheKey, () => getSources(filters))
        return { success: true, data }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: ReportQuery,
      detail: { summary: 'Trafik kaynakları' },
    }
  )

  // GET /reports/geo
  .get(
    '/geo',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
      }
      const cacheKey = `cache:report:${query.siteId}:${buildCacheHash({ ...query, type: 'geo' })}`
      try {
        const data = await cachedReport(cacheKey, () => getGeo(filters))
        return { success: true, data }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: ReportQuery,
      detail: { summary: 'Coğrafi dağılım' },
    }
  )

  // GET /reports/devices
  .get(
    '/devices',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
      }
      const cacheKey = `cache:report:${query.siteId}:${buildCacheHash({ ...query, type: 'devices' })}`
      try {
        const data = await cachedReport(cacheKey, () => getDevices(filters))
        return { success: true, data }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: ReportQuery,
      detail: { summary: 'Cihaz ve tarayıcı analizi' },
    }
  )

  // GET /reports/events
  .get(
    '/events',
    async ({query, set}) => {
      const filters = {
        siteId: query.siteId,
        from: new Date(query.from),
        to: new Date(query.to),
        limit: query.limit ?? 50,
        offset: query.offset ?? 0,
      }
      try {
        const data = await getCustomEvents(filters)
        return {
          success: true,
          data: data.events,
          meta: { total: data.total, limit: filters.limit, offset: filters.offset },
        }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      query: PaginatedQuery,
      detail: { summary: 'Özel etkinlikler' },
    }
  )

  // GET /reports/events/:eventName/properties
  .get(
    '/events/:eventName/properties',
    async ({params, query, set}) => {
      try {
        const data = await getEventProperties(
          query.siteId,
          params.eventName,
          new Date(query.from),
          new Date(query.to)
        )
        return { success: true, data }
      } catch (err: any) {
        set.status = 500
        return { success: false, error: { code: 'REPORT_FAILED', message: err.message } }
      }
    },
    {
      params: t.Object({ eventName: t.String() }),
      query: ReportQuery,
      detail: { summary: 'Etkinlik property dağılımı' },
    }
  )
