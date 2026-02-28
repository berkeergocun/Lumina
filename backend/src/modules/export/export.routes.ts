import Elysia, { t } from 'elysia'
import { requireAuth } from '../auth/auth.middleware.ts'
import {
  createExportJob,
  getExportJobStatus,
} from './export.service.ts'

const ExportBody = t.Object({
  siteId: t.String({ minLength: 12, maxLength: 12 }),
  type: t.Union([
    t.Literal('events'),
    t.Literal('sessions'),
    t.Literal('pages'),
    t.Literal('sources'),
  ]),
  format: t.Union([t.Literal('csv'), t.Literal('json')]),
  from: t.String({ format: 'date-time' }),
  to: t.String({ format: 'date-time' }),
})

export const exportRoutes = new Elysia({ prefix: '/export', tags: ['Export'] })
  .use(requireAuth())

  // POST /export — export başlat
  .post(
    '/',
    async ({body, set}) => {
      try {
        const jobId = await createExportJob(body)
        return {
          success: true,
          data: {
            jobId,
            message: 'Export işi başlatıldı. Durumu takip etmek için /export/:jobId/status kullanın.',
          },
        }
      } catch (err: any) {
        set.status = 500
        return {
          success: false,
          error: { code: 'EXPORT_FAILED', message: err.message },
        }
      }
    },
    {
      body: ExportBody,
      detail: {
        summary: 'Export başlat',
        description: 'CSV veya JSON formatında asenkron dışa aktarma işi oluşturur.',
      },
    }
  )

  // GET /export/:jobId/status — durum sorgula
  .get(
    '/:jobId/status',
    async ({params, set}) => {
      try {
        const job = await getExportJobStatus(params.jobId)
        if (!job) {
          set.status = 404
          return {
            success: false,
            error: { code: 'JOB_NOT_FOUND', message: 'Export işi bulunamadı.' },
          }
        }
        return {
          success: true,
          data: {
            jobId: job.jobId,
            status: job.status,
            createdAt: job.createdAt,
            downloadUrl: job.status === 'done' ? job.downloadUrl : undefined,
            errorMessage: job.status === 'error' ? job.errorMessage : undefined,
          },
        }
      } catch (err: any) {
        set.status = 500
        return {
          success: false,
          error: { code: 'STATUS_FAILED', message: err.message },
        }
      }
    },
    {
      params: t.Object({ jobId: t.String({ format: 'uuid' }) }),
      detail: { summary: 'Export durumu sorgula' },
    }
  )
