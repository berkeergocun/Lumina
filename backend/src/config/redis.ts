import { Redis } from 'ioredis'
import { env } from './env.ts'

let _redis: Redis | undefined

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 5) return null
        return Math.min(times * 200, 2000)
      },
    })

    _redis.on('connect', () => console.log('✅ Redis bağlantısı kuruldu'))
    _redis.on('error', (err) => console.error('❌ Redis hatası:', err.message))
    _redis.on('close', () => console.warn('⚠️  Redis bağlantısı kapatıldı'))
  }
  return _redis
}

export async function connectRedis(): Promise<void> {
  const redis = getRedis()
  await redis.connect()
}

export async function disconnectRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit()
    _redis = undefined
  }
}

// Singleton instance
export const redis = getRedis()
