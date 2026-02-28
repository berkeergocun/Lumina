import { describe, expect, it } from 'bun:test'
import { parseUserAgent } from '../../src/shared/useragent.ts'

describe('parseUserAgent()', () => {
  // ─── Masaüstü tarayıcılar ──────────────────────────────────────────────────
  it('Chrome masaüstü UA\'sını doğru parse eder', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const result = parseUserAgent(ua)

    expect(result.browser).toBe('Chrome')
    expect(result.os).toBe('Windows')
    expect(result.type).toBe('desktop')
    expect(result.browserVersion).toInclude('120')
    expect(result.osVersion).toBe('10')
  })

  it('Firefox Linux UA\'sını doğru parse eder', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
    const result = parseUserAgent(ua)

    expect(result.browser).toBe('Firefox')
    expect(result.os).toBe('Linux')
    expect(result.type).toBe('desktop')
    expect(result.browserVersion).toInclude('121')
  })

  it('Safari macOS UA\'sını doğru parse eder', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
    const result = parseUserAgent(ua)

    expect(result.browser).toBe('Safari')
    expect(result.os).toBe('macOS')
    expect(result.type).toBe('desktop')
  })

  it('Edge tarayıcısını doğru parse eder', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    const result = parseUserAgent(ua)

    expect(result.browser).toBe('Edge')
    expect(result.os).toBe('Windows')
    expect(result.type).toBe('desktop')
  })

  // ─── Mobil cihazlar ────────────────────────────────────────────────────────
  it('iPhone Safari UA\'sını mobil olarak işaretler', () => {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    const result = parseUserAgent(ua)

    expect(result.type).toBe('mobile')
    expect(result.os).toBe('iOS')
    expect(result.browser).toBe('Mobile Safari')
  })

  it('Android Chrome UA\'sını mobil olarak işaretler', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36'
    const result = parseUserAgent(ua)

    expect(result.type).toBe('mobile')
    expect(result.os).toBe('Android')
  })

  it('Samsung Internet\'i mobil olarak işaretler', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'
    const result = parseUserAgent(ua)

    expect(result.type).toBe('mobile')
  })

  // ─── Tablet ────────────────────────────────────────────────────────────────
  it('iPad UA\'sını tablet olarak işaretler', () => {
    const ua = 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    const result = parseUserAgent(ua)

    expect(result.type).toBe('tablet')
    expect(result.os).toBe('iOS')
  })

  // ─── Boş / geçersiz UA ────────────────────────────────────────────────────
  it('boş UA için güvenli fallback döner', () => {
    const result = parseUserAgent('')

    expect(result.browser).toBe('Unknown')
    expect(result.os).toBe('Unknown')
    expect(result.type).toBe('unknown')
    expect(result.browserVersion).toBe('')
    expect(result.osVersion).toBe('')
  })

  // ─── Versiyon bilgisi ─────────────────────────────────────────────────────
  it('browser ve os versiyon bilgisini string olarak döner', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const result = parseUserAgent(ua)

    expect(typeof result.browserVersion).toBe('string')
    expect(typeof result.osVersion).toBe('string')
  })
})
