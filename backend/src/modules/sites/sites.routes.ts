import Elysia from 'elysia'
import { requireAuth } from '../auth/auth.middleware.ts'
import * as sitesService from './sites.service.ts'
import { CreateSiteBody, UpdateSiteBody, SiteIdParam } from './sites.schema.ts'

export const sitesRoutes = new Elysia({ prefix: '/sites', tags: ['Sites'] })
  .use(requireAuth())

  // GET /sites - site listesi
  .get(
    '/',
    async ({ user, error }) => {
      try {
        const sites = await sitesService.getSitesByOwner(user!.id)
        return { success: true, data: sites, meta: { total: sites.length } }
      } catch (err: any) {
        return error(err.status ?? 500, {
          success: false,
          error: { code: err.code ?? 'FETCH_FAILED', message: err.message },
        })
      }
    },
    { detail: { summary: 'Site listesi' } }
  )

  // POST /sites - yeni site
  .post(
    '/',
    async ({ user, body, error }) => {
      try {
        const site = await sitesService.createSite(user!.id, body)
        return { success: true, data: site }
      } catch (err: any) {
        return error(err.status ?? 400, {
          success: false,
          error: { code: err.code ?? 'CREATE_FAILED', message: err.message },
        })
      }
    },
    {
      body: CreateSiteBody,
      detail: { summary: 'Yeni site ekle' },
    }
  )

  // GET /sites/:siteId - site detayı
  .get(
    '/:siteId',
    async ({ user, params, error }) => {
      try {
        const site = await sitesService.getSiteById(params.siteId, user!.id)
        return { success: true, data: site }
      } catch (err: any) {
        return error(err.status ?? 404, {
          success: false,
          error: { code: err.code ?? 'NOT_FOUND', message: err.message },
        })
      }
    },
    {
      params: SiteIdParam,
      detail: { summary: 'Site detayı' },
    }
  )

  // PUT /sites/:siteId - site güncelle
  .put(
    '/:siteId',
    async ({ user, params, body, error }) => {
      try {
        const site = await sitesService.updateSite(params.siteId, user!.id, body)
        return { success: true, data: site }
      } catch (err: any) {
        return error(err.status ?? 400, {
          success: false,
          error: { code: err.code ?? 'UPDATE_FAILED', message: err.message },
        })
      }
    },
    {
      params: SiteIdParam,
      body: UpdateSiteBody,
      detail: { summary: 'Site güncelle' },
    }
  )

  // DELETE /sites/:siteId - site sil
  .delete(
    '/:siteId',
    async ({ user, params, error }) => {
      try {
        await sitesService.deleteSite(params.siteId, user!.id)
        return { success: true, data: { message: 'Site silindi.' } }
      } catch (err: any) {
        return error(err.status ?? 400, {
          success: false,
          error: { code: err.code ?? 'DELETE_FAILED', message: err.message },
        })
      }
    },
    {
      params: SiteIdParam,
      detail: { summary: 'Site sil (soft delete)' },
    }
  )

  // POST /sites/:siteId/verify - site doğrula
  .post(
    '/:siteId/verify',
    async ({ user, params, error }) => {
      try {
        const result = await sitesService.verifySite(params.siteId, user!.id)
        return { success: true, data: result }
      } catch (err: any) {
        return error(err.status ?? 400, {
          success: false,
          error: { code: err.code ?? 'VERIFY_FAILED', message: err.message },
        })
      }
    },
    {
      params: SiteIdParam,
      detail: { summary: 'Site domain doğrulama' },
    }
  )

  // GET /sites/:siteId/snippet - tracker kodu
  .get(
    '/:siteId/snippet',
    async ({ user, params, error }) => {
      try {
        const snippet = sitesService.getSnippet(params.siteId, user!.id)
        return { success: true, data: snippet }
      } catch (err: any) {
        return error(err.status ?? 400, {
          success: false,
          error: { code: err.code ?? 'SNIPPET_FAILED', message: err.message },
        })
      }
    },
    {
      params: SiteIdParam,
      detail: { summary: 'Takip kodu (snippet) al' },
    }
  )
