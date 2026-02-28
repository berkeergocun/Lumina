/**
 * cleanup.worker.ts
 * - Her 30 saniyede: realtime sorted set'teki süresi dolmuş girişleri temizler
 * - Her 5 dakikada: 30 dakikadır aktif olmayan session'ları "closed" olarak işaretler
 */
import { getRedis } from '../config/redis.ts'
import { SessionModel } from '../models/session.model.ts'
import { logger } from '../shared/logger.ts'

const REALTIME_CLEANUP_INTERVAL_MS = 30_000   // 30 sn
const SESSION_CLEANUP_INTERVAL_MS  = 5 * 60_000 // 5 dk
const SESSION_IDLE_THRESHOLD_MS    = 30 * 60_000 // 30 dk

let realtimeTimer: ReturnType<typeof setInterval> | null = null
let sessionTimer:  ReturnType<typeof setInterval> | null = null

/** Realtime sorted set'ten expiry'si geçmiş girdileri kaldır */
async function cleanupRealtime() {
  const redis = getRedis()
  // Bütün realtime:active:* anahtarları bul
  const keys = await redis.keys('realtime:active:*')
  if (!keys.length) return

  const now = Date.now()
  await Promise.all(
    keys.map(key =>
      redis.zremrangebyscore(key, 0, now - SESSION_IDLE_THRESHOLD_MS)
    )
  )
}

/** 30 dakikadır aktif olmayan session'ları kapat */
async function cleanupSessions() {
  const threshold = new Date(Date.now() - SESSION_IDLE_THRESHOLD_MS)
  const result = await SessionModel.updateMany(
    { lastSeen: { $lt: threshold }, isClosed: { $ne: true } },
    { $set: { isClosed: true } }
  )
  if (result.modifiedCount > 0) {
    logger.debug(`cleanup.worker: closed ${result.modifiedCount} idle sessions`)
  }
}

export function startCleanupWorker() {
  realtimeTimer = setInterval(async () => {
    await cleanupRealtime().catch(err =>
      logger.error('cleanup.worker: realtime err', { message: err.message })
    )
  }, REALTIME_CLEANUP_INTERVAL_MS)

  sessionTimer = setInterval(async () => {
    await cleanupSessions().catch(err =>
      logger.error('cleanup.worker: session err', { message: err.message })
    )
  }, SESSION_CLEANUP_INTERVAL_MS)

  logger.info('cleanup.worker: started')
}

export function stopCleanupWorker() {
  if (realtimeTimer) { clearInterval(realtimeTimer); realtimeTimer = null }
  if (sessionTimer)  { clearInterval(sessionTimer);  sessionTimer  = null }
  logger.info('cleanup.worker: stopped')
}
