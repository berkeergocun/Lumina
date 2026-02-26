import { redis } from '../../config/redis.ts'
import { CacheKeys } from '../../shared/cache.ts'
import { getGeoData } from '../../shared/geoip.ts'
import { parseUserAgent } from '../../shared/useragent.ts'
import { isBot, detectSuspiciousPattern } from '../../shared/bot-detector.ts'
import { SiteModel } from '../../models/site.model.ts'
import { logger } from '../../shared/logger.ts'
import type { EventType, UTMData } from '../../types/index.ts'

// Rate limit: 5 saniyede 20 istek
const RATE_LIMIT = 20
const RATE_WINDOW = 5

export interface CollectPayload {
  siteId: string
  sessionId: string
  type: EventType
  url: string
  name?: string
  properties?: Record<string, string | number>
  referrer?: string
  utm?: UTMData
  screen?: { width?: number; height?: number }
  language?: string
  timestamp?: string
}

/**
 * Rate limit kontrolü. Redis sayacı kullanır.
 * @returns true = limit aşıldı
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  const key = CacheKeys.rateLimit(ip)
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, RATE_WINDOW)
  }
  return count > RATE_LIMIT
}

/**
 * Site domain whitelist kontrolü.
 */
async function validateSite(
  siteId: string,
  origin: string | undefined
): Promise<boolean> {
  // Önce Redis önbelleğine bak
  const cacheKey = `site:domain:${siteId}`
  let domain = await redis.get(cacheKey)

  if (!domain) {
    const site = await SiteModel.findOne({ siteId, deletedAt: null })
    if (!site) return false
    domain = site.domain
    await redis.setex(cacheKey, 300, domain) // 5 dk önbellek
  }

  if (!origin) return true // origin yoksa kabul et (test ortamı)

  const cleanOrigin = origin
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]!
    .toLowerCase()

  return cleanOrigin === domain || cleanOrigin.endsWith(`.${domain}`)
}

/**
 * Olayı Redis buffer'a yazar. Worker daha sonra MongoDB'ye flush eder.
 */
export async function collectEvent(
  payload: CollectPayload,
  ip: string,
  userAgent: string,
  origin: string | undefined
): Promise<{ accepted: boolean; reason?: string }> {
  // Domain whitelist kontrolü
  const siteValid = await validateSite(payload.siteId, origin)
  if (!siteValid) {
    return { accepted: false, reason: 'INVALID_SITE' }
  }

  // UUID v4 formatı kontrolü
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidV4Regex.test(payload.sessionId)) {
    return { accepted: false, reason: 'INVALID_SESSION_ID' }
  }

  // Bot tespiti
  const botDetected =
    isBot(userAgent) || detectSuspiciousPattern(payload.referrer, payload.url)

  // Cihaz ve coğrafi bilgi çıkar
  const device = parseUserAgent(userAgent)
  const geo = await getGeoData(ip)

  // Ham IP saklanmıyor, sadece geo data
  const eventData = {
    siteId: payload.siteId,
    sessionId: payload.sessionId,
    type: payload.type,
    url: payload.url,
    name: payload.name,
    properties: payload.properties,
    referrer: payload.referrer,
    utm: payload.utm ?? {},
    geo,
    device: {
      ...device,
      screenWidth: payload.screen?.width,
      screenHeight: payload.screen?.height,
    },
    timestamp: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString(),
    isBot: botDetected,
  }

  // Redis buffer'a ekle
  const bufferKey = CacheKeys.ingestionBuffer(payload.siteId)
  await redis.rpush(bufferKey, JSON.stringify(eventData))

  // Realtime aktivite güncelle (bot değilse)
  if (!botDetected) {
    await updateRealtime(payload.siteId, payload.sessionId, payload.url)
  }

  logger.debug('Olay alındı', { siteId: payload.siteId, type: payload.type })

  return { accepted: true }
}

/**
 * Redis realtime yapısını günceller.
 */
async function updateRealtime(siteId: string, sessionId: string, url: string) {
  const now = Date.now()
  const activeKey = CacheKeys.realtimeActive(siteId)
  const pagesKey = CacheKeys.realtimePages(siteId)

  // Sorted set'e session ekle (score = timestamp)
  await redis.zadd(activeKey, now, sessionId)
  // 5 dakikadan eski sessionları temizle
  await redis.zremrangebyscore(activeKey, 0, now - 5 * 60 * 1000)

  // Sayfaları takip et
  await redis.hset(pagesKey, url, String(now))
  await redis.expire(pagesKey, 300) // 5 dk
}

/**
 * Realtime veriyi döndürür.
 */
export async function getRealtimeData(siteId: string) {
  const now = Date.now()
  const activeKey = CacheKeys.realtimeActive(siteId)
  const pagesKey = CacheKeys.realtimePages(siteId)

  const activeUsers = await redis.zcount(activeKey, now - 5 * 60 * 1000, '+inf')
  const pagesRaw = await redis.hgetall(pagesKey)

  const cutoff = now - 5 * 60 * 1000
  const activePages = Object.entries(pagesRaw ?? {})
    .filter(([, ts]) => Number(ts) > cutoff)
    .map(([url]) => url)
    .reduce((acc: Record<string, number>, url) => {
      acc[url] = (acc[url] ?? 0) + 1
      return acc
    }, {})

  return {
    activeUsers,
    activePages: Object.entries(activePages).map(([url, visitors]) => ({ url, visitors })),
    updatedAt: new Date().toISOString(),
  }
}
