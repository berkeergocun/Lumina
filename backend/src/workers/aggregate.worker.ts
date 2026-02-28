/**
 * aggregate.worker.ts
 * Her gün 02:00 UTC'de önceki günün event'larını DailyAggregate koleksiyonuna toplar.
 */
import { EventModel } from '../models/event.model.ts'
import { DailyAggregateModel } from '../models/aggregate.model.ts'
import { SiteModel } from '../models/site.model.ts'
import { logger } from '../shared/logger.ts'

/** "YYYY-MM-DD" formatında tarih string döndür */
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

/** Bir siteId + tarih için aggregate hesapla ve upsert et */
async function aggregateSiteDay(siteId: string, date: string) {
  const start = new Date(date + 'T00:00:00Z')
  const end   = new Date(date + 'T23:59:59.999Z')

  const basePipeline: any[] = [
    { $match: { siteId, timestamp: { $gte: start, $lte: end }, isBot: false } },
  ]

  // Sayılar
  const [overview, byPage, byCountry, bySource, byDevice, byBrowser] = await Promise.all([
    EventModel.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: null,
          pageviews: { $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] } },
          uniqueVisitors: { $addToSet: '$visitorId' },
          sessions: { $addToSet: '$sessionId' },
          bounced: {
            $sum: { $cond: [{ $and: [{ $eq: ['$type', 'pageview'] }, { $eq: ['$isBounce', true] }] }, 1, 0] },
          },
        },
      },
    ]),
    EventModel.aggregate([
      ...basePipeline,
      { $match: { type: 'pageview' } },
      { $group: { _id: '$url', pageviews: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
      { $sort: { pageviews: -1 } },
      { $limit: 100 },
      { $project: { page: '$_id', pageviews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
    ]),
    EventModel.aggregate([
      ...basePipeline,
      { $group: { _id: '$geo.country', pageviews: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
      { $sort: { pageviews: -1 } },
      { $limit: 100 },
      { $project: { country: '$_id', pageviews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
    ]),
    EventModel.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: { $ifNull: ['$utm.source', { $cond: [{ $ne: ['$referrer', ''] }, '$referrer', 'direct'] }] },
          pageviews: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
        },
      },
      { $sort: { pageviews: -1 } },
      { $limit: 100 },
      { $project: { source: '$_id', pageviews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
    ]),
    EventModel.aggregate([
      ...basePipeline,
      { $group: { _id: '$device.type', pageviews: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
      { $sort: { pageviews: -1 } },
      { $project: { device: '$_id', pageviews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
    ]),
    EventModel.aggregate([
      ...basePipeline,
      { $group: { _id: '$device.browser', pageviews: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
      { $sort: { pageviews: -1 } },
      { $limit: 30 },
      { $project: { browser: '$_id', pageviews: 1, visitors: { $size: '$visitors' }, _id: 0 } },
    ]),
  ])

  const ov = overview[0] ?? { pageviews: 0, uniqueVisitors: [], sessions: [], bounced: 0 }

  await DailyAggregateModel.findOneAndUpdate(
    { siteId, date },
    {
      $set: {
        pageviews: ov.pageviews,
        uniqueVisitors: ov.uniqueVisitors.length,
        sessions: ov.sessions.length,
        bounceRate: ov.sessions.length > 0 ? ov.bounced / ov.sessions.length : 0,
        byPage: byPage,
        byCountry: byCountry,
        bySource: bySource,
        byDevice: byDevice,
        byBrowser: byBrowser,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  logger.info(`aggregate.worker: aggregated ${siteId} for ${date}`)
}

/** Tüm aktif siteler için dün'ü aggregate et */
async function runAggregation() {
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const dateStr = toDateStr(yesterday)

  const sites = await SiteModel.find({ deletedAt: null }).select('siteId').lean()
  for (const site of sites) {
    try {
      await aggregateSiteDay(site.siteId, dateStr)
    } catch (err: any) {
      logger.error('aggregate.worker: site err', { siteId: site.siteId, message: err.message })
    }
  }
}

/** 02:00 UTC'ye kaç ms kaldığını hesapla */
function msUntil02UTC(): number {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 2, 0, 0))
  return next.getTime() - now.getTime()
}

let scheduled: ReturnType<typeof setTimeout> | null = null

function scheduleNext() {
  const delay = msUntil02UTC()
  logger.info(`aggregate.worker: next run in ${Math.round(delay / 60000)} min`)
  scheduled = setTimeout(async () => {
    await runAggregation().catch(err =>
      logger.error('aggregate.worker: runAggregation failed', { message: err.message })
    )
    scheduleNext()
  }, delay)
}

export function startAggregateWorker() {
  scheduleNext()
  logger.info('aggregate.worker: started')
}

export function stopAggregateWorker() {
  if (scheduled) {
    clearTimeout(scheduled)
    scheduled = null
    logger.info('aggregate.worker: stopped')
  }
}
