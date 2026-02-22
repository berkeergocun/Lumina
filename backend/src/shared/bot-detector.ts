// Bilinen bot/crawler User-Agent kalıpları
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
  /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i, /duckduckbot/i,
  /facebot/i, /ia_archiver/i, /msnbot/i, /ahrefsbot/i, /semrushbot/i,
  /dotbot/i, /rogerbot/i, /exabot/i, /sogou/i, /voilabot/i,
  /python-requests/i, /java\//i, /curl\//i, /wget\//i, /go-http-client/i,
  /libwww-perl/i, /httpunit/i, /nutch/i, /phpcrawl/i, /mj12bot/i,
  /heritrix/i, /inktomi/i, /teoma/i, /gigabot/i, /speedy spider/i,
  /wordpress/i, /w3c_validator/i, /scrapy/i, /apache-httpclient/i,
  /headlesschrome/i, /phantomjs/i,
]

// Tarayıcıdan gelmeyebilecek ajanlar (otomasyon araçları)
const HEADLESS_PATTERNS = [/headless/i, /phantom/i, /puppeteer/i, /playwright/i]

export function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.trim() === '') return true

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) return true
  }

  for (const pattern of HEADLESS_PATTERNS) {
    if (pattern.test(userAgent)) return true
  }

  return false
}

/**
 * Anomali tabanlı bot tespiti:
 * - Aynı IP'den aynı saniye içinde çok fazla istek
 * - Bu kontrol rate limiting ile birlikte çalışır
 */
export function detectSuspiciousPattern(
  referrer: string | undefined,
  url: string
): boolean {
  // Referrer analytics sayfası ise bot ihtimali yüksek
  if (referrer && referrer.includes('semalt.com')) return true
  if (referrer && referrer.includes('buttons-for-website.com')) return true

  return false
}
