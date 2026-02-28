/**
 * flush.worker.ts
 * Redis ingestion buffer'ını her 5 saniyede veya 1000 event biriktiğinde
 * MongoDB'ye toplu (bulk) yazar.
 */
import { getRedis } from '../config/redis.ts'
import { EventModel } from '../models/event.model.ts'
import { SessionModel } from '../models/session.model.ts'
import { logger } from '../shared/logger.ts'

const BUFFER_KEY_PREFIX = 'ingestion:buffer:'
const FLUSH_INTERVAL_MS = 5_000
const FLUSH_BATCH_SIZE = 1_000

/** Tüm aktif site buffer anahtarlarını bul */
async function getBufferKeys(redis: ReturnType<typeof getRedis>): Promise<string[]> {
  return redis.keys(`${BUFFER_KEY_PREFIX}*`)
}

/** Belirli bir siteId için buffer'ı flush et */
async function flushSite(redis: ReturnType<typeof getRedis>, key: string) {
  // LRANGE 0 batchSize-1 al, ardından LTRIM ile temizle
  const raw = await redis.lrange(key, 0, FLUSH_BATCH_SIZE - 1)
  if (!raw.length) return

  await redis.ltrim(key, raw.length, -1)

  const events: any[] = []
  const sessionMap = new Map<string, any>()

  for (const item of raw) {
    try {
      const payload = JSON.parse(item)
      events.push(payload)

      // Session güncelleme verisi
      const { sessionId, siteId, type, url, timestamp } = payload
      if (!sessionId) continue

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId,
          siteId,
          pageviews: 0,
          events: 0,
          lastSeen: timestamp,
          exitUrl: url,
        })
      }
      const s = sessionMap.get(sessionId)!
      s.lastSeen = timestamp
      s.exitUrl = url
      if (type === 'pageview') s.pageviews++
      else s.events++
    } catch {
      /* bozuk JSON'u atla */
    }
  }

  // Bulk event insert
  if (events.length) {
    await EventModel.insertMany(events, { ordered: false }).catch(err => {
      logger.error('flush.worker: event insert err', { message: err.message })
    })
  }

  // Session upsert
  const sessionOps = [...sessionMap.values()].map(s => ({
    updateOne: {
      filter: { sessionId: s.sessionId },
      update: {
        $set: { lastSeen: s.lastSeen, exitUrl: s.exitUrl },
        $inc: { pageviews: s.pageviews, events: s.events },
        $setOnInsert: { siteId: s.siteId, sessionId: s.sessionId, entryUrl: s.exitUrl },
      },
      upsert: true,
    },
  }))

  if (sessionOps.length) {
    await SessionModel.bulkWrite(sessionOps as any, { ordered: false }).catch(err => {
      logger.error('flush.worker: session bulkWrite err', { message: err.message })
    })
  }

  logger.debug(`flush.worker: flushed ${events.length} events from ${key}`)
}

let timer: ReturnType<typeof setInterval> | null = null

export function startFlushWorker() {
  const redis = getRedis()

  timer = setInterval(async () => {
    try {
      const keys = await getBufferKeys(redis)
      await Promise.all(keys.map(k => flushSite(redis, k)))
    } catch (err: any) {
      logger.error('flush.worker: interval err', { message: err.message })
    }
  }, FLUSH_INTERVAL_MS)

  logger.info('flush.worker: started (interval=' + FLUSH_INTERVAL_MS + 'ms)')
}

export function stopFlushWorker() {
  if (timer) {
    clearInterval(timer)
    timer = null
    logger.info('flush.worker: stopped')
  }
}
