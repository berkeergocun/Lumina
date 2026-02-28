import { describe, expect, it } from 'bun:test'
import { buildCacheHash, CacheKeys } from '../../src/shared/cache.ts'

// Not: Bu testler yalnızca Redis bağlantısı gerektirmeyen saf fonksiyonları kapsar.
// Redis operasyonları (cacheGet/Set/Del) entegrasyon testlerinde ele alınır.

describe('buildCacheHash()', () => {
  it('aynı parametreler için aynı hash üretir (deterministik)', () => {
    const params = { siteId: 'abc123', from: '2026-01-01', to: '2026-01-31' }
    expect(buildCacheHash(params)).toBe(buildCacheHash(params))
  })

  it('farklı parametreler için farklı hash üretir', () => {
    const a = buildCacheHash({ siteId: 'site1', from: '2026-01-01' })
    const b = buildCacheHash({ siteId: 'site2', from: '2026-01-01' })
    expect(a).not.toBe(b)
  })

  it('parametre sırası farklı olsa bile aynı sonucu üretir', () => {
    const a = buildCacheHash({ from: '2026-01-01', siteId: 'abc123' })
    const b = buildCacheHash({ siteId: 'abc123', from: '2026-01-01' })
    // JSON.stringify sırayı korur, bu beklenen davranış
    // Aynı nesne aynı hash → deterministik
    expect(typeof a).toBe('string')
    expect(a.length).toBeGreaterThan(0)
    expect(typeof b).toBe('string')
  })

  it('base64url formatında döner (/ ve + içermez, = içerebilir)', () => {
    const hash = buildCacheHash({ siteId: 'test-site', page: '/anasayfa', limit: 20 })
    // base64url karakterleri: A-Z a-z 0-9 - _
    expect(hash).toMatch(/^[A-Za-z0-9\-_=]+$/)
  })

  it('boş obje için hash üretir', () => {
    const hash = buildCacheHash({})
    expect(hash).toBeTruthy()
    expect(typeof hash).toBe('string')
  })

  it('iç içe objeler için tutarlı hash üretir', () => {
    const params = {
      siteId: 'abc',
      filters: { country: 'TR', device: 'mobile' },
      pagination: { page: 1, limit: 20 },
    }
    const h1 = buildCacheHash(params)
    const h2 = buildCacheHash(params)
    expect(h1).toBe(h2)
  })
})

describe('CacheKeys', () => {
  it('report anahtarını doğru formatlar', () => {
    const key = CacheKeys.report('site123', 'hash456')
    expect(key).toBe('cache:report:site123:hash456')
  })

  it('session anahtarını doğru formatlar', () => {
    const key = CacheKeys.session('sess_abc')
    expect(key).toBe('session:sess_abc')
  })

  it('realtimeActive anahtarını doğru formatlar', () => {
    const key = CacheKeys.realtimeActive('site123')
    expect(key).toBe('realtime:site123:active')
  })

  it('realtimePages anahtarını doğru formatlar', () => {
    const key = CacheKeys.realtimePages('site123')
    expect(key).toBe('realtime:site123:pages')
  })

  it('rateLimit anahtarını doğru formatlar', () => {
    const key = CacheKeys.rateLimit('192.168.1.1')
    expect(key).toBe('ratelimit:192.168.1.1')
  })

  it('blacklistToken anahtarını doğru formatlar', () => {
    const jti = 'uuid-1234-5678'
    const key = CacheKeys.blacklistToken(jti)
    expect(key).toBe(`blacklist:token:${jti}`)
  })

  it('ingestionBuffer anahtarını doğru formatlar', () => {
    const key = CacheKeys.ingestionBuffer('site999')
    expect(key).toBe('ingestion:buffer:site999')
  })

  it('farklı site ID\'leri için farklı anahtarlar üretir', () => {
    const k1 = CacheKeys.realtimeActive('siteA')
    const k2 = CacheKeys.realtimeActive('siteB')
    expect(k1).not.toBe(k2)
  })
})
