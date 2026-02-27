import { EventModel } from '../../models/event.model.ts'
import { SessionModel } from '../../models/session.model.ts'
import { redis } from '../../config/redis.ts'
import { logger } from '../../shared/logger.ts'

type ExportType = 'events' | 'sessions' | 'pages' | 'sources'
type ExportFormat = 'csv' | 'json'

interface ExportJob {
  jobId: string
  siteId: string
  type: ExportType
  format: ExportFormat
  from: Date
  to: Date
  status: 'pending' | 'processing' | 'done' | 'error'
  downloadUrl?: string
  errorMessage?: string
  createdAt: Date
}

const JOB_TTL = 60 * 60 // 1 saat
const MAX_ROWS = 500_000

export async function createExportJob(params: {
  siteId: string
  type: ExportType
  format: ExportFormat
  from: string
  to: string
}): Promise<string> {
  const jobId = crypto.randomUUID()
  const job: ExportJob = {
    jobId,
    siteId: params.siteId,
    type: params.type,
    format: params.format,
    from: new Date(params.from),
    to: new Date(params.to),
    status: 'pending',
    createdAt: new Date(),
  }

  await redis.setex(`export:job:${jobId}`, JOB_TTL, JSON.stringify(job))
  logger.info('Export işi oluşturuldu', { jobId, ...params })

  // Asenkron olarak işle
  processExportJob(jobId, job).catch((err) => {
    logger.error('Export işi başarısız', { jobId, error: err.message })
  })

  return jobId
}

export async function getExportJobStatus(jobId: string): Promise<ExportJob | null> {
  const raw = await redis.get(`export:job:${jobId}`)
  if (!raw) return null
  return JSON.parse(raw) as ExportJob
}

async function processExportJob(jobId: string, job: ExportJob): Promise<void> {
  // Durumu "processing" olarak güncelle
  await updateJobStatus(jobId, { status: 'processing' })

  try {
    const data = await fetchExportData(job)
    const content = job.format === 'csv' ? toCSV(data) : JSON.stringify(data, null, 2)

    // Gerçek üretimde: S3/R2'ya yükle, signed URL üret
    // Şimdilik base64 data URL simülasyonu
    const buffer = Buffer.from(content, 'utf-8')
    const dataUrl = `data:application/${job.format};base64,${buffer.toString('base64')}`

    await updateJobStatus(jobId, {
      status: 'done',
      downloadUrl: dataUrl,
    })

    logger.info('Export tamamlandı', { jobId, rows: data.length })
  } catch (err: any) {
    await updateJobStatus(jobId, {
      status: 'error',
      errorMessage: err.message,
    })
  }
}

async function updateJobStatus(jobId: string, update: Partial<ExportJob>): Promise<void> {
  const raw = await redis.get(`export:job:${jobId}`)
  if (!raw) return
  const job = { ...JSON.parse(raw), ...update }
  await redis.setex(`export:job:${jobId}`, JOB_TTL, JSON.stringify(job))
}

async function fetchExportData(job: ExportJob): Promise<Record<string, unknown>[]> {
  const match: Record<string, unknown> = {
    siteId: job.siteId,
    isBot: false,
  }

  switch (job.type) {
    case 'events':
    case 'pages': {
      const timestampField = 'timestamp'
      match[timestampField] = { $gte: job.from, $lte: job.to }
      if (job.type === 'pages') match['type'] = 'pageview'

      const docs = await EventModel.find(match)
        .select('-__v -_id')
        .limit(MAX_ROWS)
        .lean()

      return docs.map(d => ({
        sessionId: d.sessionId,
        type: d.type,
        url: d.url,
        referrer: d.referrer ?? '',
        country: d.geo?.country,
        city: d.geo?.city,
        browser: d.device?.browser,
        os: d.device?.os,
        deviceType: d.device?.type,
        timestamp: d.timestamp?.toISOString(),
      }))
    }

    case 'sessions':
    case 'sources': {
      match['startedAt'] = { $gte: job.from, $lte: job.to }

      const docs = await SessionModel.find(match)
        .select('-__v -_id')
        .limit(MAX_ROWS)
        .lean()

      return docs.map(d => ({
        sessionId: d.sessionId,
        startedAt: d.startedAt?.toISOString(),
        duration: d.duration,
        pageviews: d.pageviews,
        isBounce: d.isBounce,
        entryUrl: d.entryUrl,
        exitUrl: d.exitUrl ?? '',
        country: d.geo?.country,
        browser: d.device?.browser,
        os: d.device?.os,
        referrer: d.referrer ?? '',
        utmSource: d.utm?.source ?? '',
        utmMedium: d.utm?.medium ?? '',
        utmCampaign: d.utm?.campaign ?? '',
      }))
    }

    default:
      return []
  }
}

function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0]!)
  const rows = data.map(row =>
    headers.map(h => {
      const v = row[h]
      if (v === null || v === undefined) return ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}
