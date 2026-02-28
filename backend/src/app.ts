import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { env } from './config/env.ts'

import { authRoutes }     from './modules/auth/auth.routes.ts'
import { sitesRoutes }    from './modules/sites/sites.routes.ts'
import { collectRoutes }  from './modules/collect/collect.routes.ts'
import { reportsRoutes }  from './modules/reports/reports.routes.ts'
import { realtimeRoutes } from './modules/realtime/realtime.routes.ts'
import { exportRoutes }   from './modules/export/export.routes.ts'
import { adminRoutes }    from './modules/admin/admin.routes.ts'

export const app = new Elysia()
  // ── CORS ─────────────────────────────────────────────────────────────────
  .use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map(s => s.trim()),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86_400,
    })
  )

  // ── Swagger / OpenAPI ────────────────────────────────────────────────────
  .use(
    swagger({
      path: '/docs',
      documentation: {
        info: {
          title: 'Lumina Analytics API',
          version: '1.0.0',
          description: 'Lumina — Gizlilik odaklı (GDPR uyumlu), self-hosted web analitik platformu. Gerçek zamanlı ziyaretçi takibi, oturum analizi, coğrafi dağılım, cihaz raporları ve özel etkinlik izleme.',
        },
        tags: [
          { name: 'Auth',     description: 'Kimlik doğrulama & yetkilendirme' },
          { name: 'Sites',    description: 'Site yönetimi' },
          { name: 'Collect',  description: 'Event toplama' },
          { name: 'Reports',  description: 'Analitik raporlar' },
          { name: 'Realtime', description: 'Gerçek zamanlı veriler' },
          { name: 'Export',   description: 'Veri dışa aktarma' },
          { name: 'Admin',    description: 'Platform yönetimi' },
        ],
        components: {
          securitySchemes: {
            BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    })
  )

  // ── Health check ─────────────────────────────────────────────────────────
  .get('/health', () => ({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))

  // ── API v1 rotaları ───────────────────────────────────────────────────────
  .group('/api/v1', app =>
    app
      .use(authRoutes)
      .use(sitesRoutes)
      .use(collectRoutes)
      .use(reportsRoutes)
      .use(realtimeRoutes)
      .use(exportRoutes)
      .use(adminRoutes)
  )

  // ── Global hata yakalayıcı ────────────────────────────────────────────────
  .onError(({ code, error, set }) => {
    const err = error as any
    const status = err.status ?? (code === 'NOT_FOUND' ? 404 : code === 'VALIDATION' ? 422 : 500)
    set.status = status

    return {
      success: false,
      error: {
        code: err.code ?? code,
        message: err.message ?? 'Beklenmeyen bir hata oluştu.',
      },
    }
  })
