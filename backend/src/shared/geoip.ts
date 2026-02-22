import type { GeoData } from '../types/index.ts'
import { env } from '../config/env.ts'
import { logger } from './logger.ts'

// GeoIP veritabanı yükleme (MaxMind GeoLite2)
// Üretimde @maxmind/geoip2-node kullanılabilir
// Geliştirme için basit fallback sağlanmıştır

let Reader: unknown = null

async function loadReader() {
  if (!env.GEOIP_ENABLED) return null
  if (Reader) return Reader

  try {
    const { Reader: GeoReader } = await import('@maxmind/geoip2-node' as string)
    Reader = await GeoReader.open(env.MAXMIND_DB_PATH, { cache: { max: 4096 } })
    logger.info('GeoIP veritabanı yüklendi')
    return Reader
  } catch {
    logger.warn('GeoIP veritabanı yüklenemedi, fallback kullanılıyor')
    return null
  }
}

export async function getGeoData(ip: string): Promise<GeoData> {
  const fallback: GeoData = {
    country: 'Unknown',
    countryCode: 'XX',
    city: 'Unknown',
    region: 'Unknown',
  }

  if (!env.GEOIP_ENABLED || !ip || ip === '::1' || ip === '127.0.0.1') {
    return fallback
  }

  const reader = await loadReader()
  if (!reader) return fallback

  try {
    // @ts-ignore - dinamik import
    const result = reader.city(ip)
    return {
      country: result?.country?.names?.en ?? 'Unknown',
      countryCode: result?.country?.isoCode ?? 'XX',
      city: result?.city?.names?.en ?? 'Unknown',
      region: result?.subdivisions?.[0]?.names?.en ?? 'Unknown',
    }
  } catch {
    return fallback
  }
}

/**
 * IP adresini anonim tutar fakat coğrafi çıkarım için geçici olarak kullanılır.
 * Ham IP asla saklanmaz.
 */
export function hashIP(ip: string): string {
  // Crypto hash - kişisel veri değil, bot tespiti için
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + new Date().toISOString().slice(0, 10)) // günlük salt
  return Bun.hash(data).toString(16)
}
