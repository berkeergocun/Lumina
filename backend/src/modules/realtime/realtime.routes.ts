import Elysia, { t } from 'elysia'
import { requireAuth } from '../auth/auth.middleware.ts'
import { createSSEStream } from './realtime.service.ts'
import { getRealtimeData } from '../collect/collect.service.ts'

export const realtimeRoutes = new Elysia({ prefix: '/realtime', tags: ['Realtime'] })
  .use(requireAuth())

  // GET /realtime/stream?siteId= — SSE stream
  .get(
    '/stream',
    async ({ query, set }) => {
      set.headers['Content-Type'] = 'text/event-stream'
      set.headers['Cache-Control'] = 'no-cache'
      set.headers['Connection'] = 'keep-alive'
      set.headers['X-Accel-Buffering'] = 'no' // Nginx buffering devre dışı

      const stream = await createSSEStream(query.siteId)
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    },
    {
      query: t.Object({
        siteId: t.String({ minLength: 12, maxLength: 12 }),
      }),
      detail: {
        summary: 'Gerçek zamanlı SSE akışı',
        description: 'Server-Sent Events ile 5 saniyede bir aktif kullanıcı ve sayfa verisi gönderir.',
      },
    }
  )

  // GET /realtime/snapshot?siteId= — tek seferlik snapshot
  .get(
    '/snapshot',
    async ({ query, error }) => {
      try {
        const data = await getRealtimeData(query.siteId)
        return { success: true, data }
      } catch (err: any) {
        return error(500, {
          success: false,
          error: { code: 'REALTIME_FAILED', message: err.message },
        })
      }
    },
    {
      query: t.Object({
        siteId: t.String({ minLength: 12, maxLength: 12 }),
      }),
      detail: { summary: 'Gerçek zamanlı anlık görüntü (SSE yerine tek istek)' },
    }
  )
