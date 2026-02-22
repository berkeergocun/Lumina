import { redis } from '../config/redis.ts'
import { env } from '../config/env.ts'

export const CacheKeys = {
  report: (siteId: string, hash: string) => `cache:report:${siteId}:${hash}`,
  session: (sessionId: string) => `session:${sessionId}`,
  realtimeActive: (siteId: string) => `realtime:${siteId}:active`,
  realtimePages: (siteId: string) => `realtime:${siteId}:pages`,
  rateLimit: (ip: string) => `ratelimit:${ip}`,
  blacklistToken: (jti: string) => `blacklist:token:${jti}`,
  ingestionBuffer: (siteId: string) => `ingestion:buffer:${siteId}`,
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = env.REPORT_CACHE_TTL
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key)
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

/**
 * Raporlar için basit hash oluşturur
 */
export function buildCacheHash(params: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(params)).toString('base64url')
}
