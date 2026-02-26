import Elysia from 'elysia'
import { CollectBody } from './collect.schema.ts'
import { collectEvent, checkRateLimit } from './collect.service.ts'

// 1x1 transparan GIF
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export const collectRoutes = new Elysia({ prefix: '/collect', tags: ['Collect'] })

  // POST /collect - ana olay veri toplama endpoint'i
  .post(
    '/',
    async ({ body, request, error, set }) => {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        '127.0.0.1'

      // Rate limit kontrolü
      const limited = await checkRateLimit(ip)
      if (limited) {
        set.status = 429
        return {
          success: false,
          error: { code: 'RATE_LIMITED', message: 'Çok fazla istek.' },
        }
      }

      const userAgent = request.headers.get('user-agent') ?? ''
      const origin = request.headers.get('origin') ?? request.headers.get('referer')

      const result = await collectEvent(body, ip, userAgent, origin ?? undefined)

      if (!result.accepted) {
        set.status = 400
        return {
          success: false,
          error: { code: result.reason ?? 'REJECTED', message: 'Olay kabul edilmedi.' },
        }
      }

      set.status = 200
      set.headers['Access-Control-Allow-Origin'] = '*'
      return { success: true, data: { queued: true } }
    },
    {
      body: CollectBody,
      detail: {
        summary: 'Olay topla',
        description:
          'Sayfa görüntüleme, özel etkinlik, oturum başlangıç/bitiş olaylarını alır.',
        security: [],
      },
    }
  )

  // OPTIONS /collect - CORS preflight
  .options('/', ({ set }) => {
    set.headers['Access-Control-Allow-Origin'] = '*'
    set.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    set.status = 204
    return ''
  })

  // GET /collect/ping - 1x1 GIF fallback (tarayıcı uyumluluğu)
  .get(
    '/ping',
    async ({ query, request, set }) => {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        '127.0.0.1'

      const userAgent = request.headers.get('user-agent') ?? ''

      if (query.siteId && query.sessionId) {
        await collectEvent(
          {
            siteId: query.siteId,
            sessionId: query.sessionId,
            type: 'pageview',
            url: query.url ?? '/',
            referrer: query.ref,
          },
          ip,
          userAgent,
          request.headers.get('referer') ?? undefined
        ).catch(() => {})
      }

      set.headers['Content-Type'] = 'image/gif'
      set.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
      set.headers['Access-Control-Allow-Origin'] = '*'
      return new Response(TRANSPARENT_GIF, {
        headers: { 'Content-Type': 'image/gif' },
      })
    },
    {
      detail: {
        summary: '1x1 GIF ping (fallback)',
        description: 'sendBeacon desteklemeyen tarayıcılar için fallback.',
        security: [],
      },
    }
  )

  // GET /collect/tracker.js - Tracker betiğini sun
  .get(
    '/tracker.js',
    ({ set }) => {
      set.headers['Content-Type'] = 'application/javascript; charset=utf-8'
      set.headers['Cache-Control'] = 'public, max-age=3600'
      set.headers['Access-Control-Allow-Origin'] = '*'
      return Bun.file(new URL('./tracker/tracker.js', import.meta.url))
    },
    {
      detail: {
        summary: 'Tracker JS betiği',
        security: [],
      },
    }
  )
