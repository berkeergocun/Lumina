import { describe, expect, it } from 'bun:test'
import { isBot, detectSuspiciousPattern } from '../../src/shared/bot-detector.ts'

describe('isBot()', () => {
  // ─── Gerçek tarayıcılar → false ───────────────────────────────────────────
  it('Chrome masaüstü kullanıcısını bot olarak işaretlemez', () => {
    expect(
      isBot(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )
    ).toBe(false)
  })

  it('Firefox masaüstü kullanıcısını bot olarak işaretlemez', () => {
    expect(
      isBot(
        'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
      )
    ).toBe(false)
  })

  it('Safari mobil kullanıcısını bot olarak işaretlemez', () => {
    expect(
      isBot(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
      )
    ).toBe(false)
  })

  it('Edge tarayıcısını bot olarak işaretlemez', () => {
    expect(
      isBot(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      )
    ).toBe(false)
  })

  // ─── Bilinen botlar → true ─────────────────────────────────────────────────
  it('Googlebot\'u bot olarak işaretler', () => {
    expect(
      isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    ).toBe(true)
  })

  it('Bingbot\'u bot olarak işaretler', () => {
    expect(
      isBot('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')
    ).toBe(true)
  })

  it('Yandexbot\'u bot olarak işaretler', () => {
    expect(
      isBot('Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)')
    ).toBe(true)
  })

  it('curl\'ü bot olarak işaretler', () => {
    expect(isBot('curl/7.88.0')).toBe(true)
  })

  it('Python requests\'i bot olarak işaretler', () => {
    expect(isBot('python-requests/2.31.0')).toBe(true)
  })

  it('Go HTTP client\'i bot olarak işaretler', () => {
    expect(isBot('Go-http-client/2.0')).toBe(true)
  })

  it('Scrapy\'yi bot olarak işaretler', () => {
    expect(isBot('Scrapy/2.11.0 (+https://scrapy.org)')).toBe(true)
  })

  it('AhrefsBot\'u bot olarak işaretler', () => {
    expect(isBot('Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)')).toBe(true)
  })

  it('SemrushBot\'u bot olarak işaretler', () => {
    expect(isBot('Mozilla/5.0 (compatible; SemrushBot/7; +http://www.semrush.com/bot.html)')).toBe(true)
  })

  // ─── Headless tarayıcılar → true ──────────────────────────────────────────
  it('HeadlessChrome\'u bot olarak işaretler', () => {
    expect(
      isBot('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36')
    ).toBe(true)
  })

  it('PhantomJS\'i bot olarak işaretler', () => {
    expect(isBot('Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34')).toBe(true)
  })

  it('Puppeteer\'ı bot olarak işaretler', () => {
    expect(isBot('Mozilla/5.0 (puppeteer) Chrome/120.0.0.0')).toBe(true)
  })

  // ─── Boş / geçersiz UA → true ─────────────────────────────────────────────
  it('boş string\'i bot olarak işaretler', () => {
    expect(isBot('')).toBe(true)
  })

  it('yalnızca boşluk içeren UA\'yı bot olarak işaretler', () => {
    expect(isBot('   ')).toBe(true)
  })
})

describe('detectSuspiciousPattern()', () => {
  it('semalt.com referrer\'ını şüpheli bulur', () => {
    expect(detectSuspiciousPattern('http://semalt.com', '/anasayfa')).toBe(true)
  })

  it('buttons-for-website.com referrer\'ını şüpheli bulur', () => {
    expect(detectSuspiciousPattern('http://buttons-for-website.com', '/blog')).toBe(true)
  })

  it('normal google referrer\'ını şüpheli bulmaz', () => {
    expect(detectSuspiciousPattern('https://google.com', '/urunler')).toBe(false)
  })

  it('undefined referrer\'ı şüpheli bulmaz', () => {
    expect(detectSuspiciousPattern(undefined, '/anasayfa')).toBe(false)
  })

  it('direkt trafik (boş referrer) şüpheli değildir', () => {
    expect(detectSuspiciousPattern('', '/anasayfa')).toBe(false)
  })
})
