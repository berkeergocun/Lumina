/**
 * tests/setup.ts
 * Bun test preload — Her test dosyasından önce çalışır.
 * Ortam değişkenlerini .env.test'ten yükler ve global teardown ayarlar.
 */
import { afterAll, beforeAll } from 'bun:test'

// .env.test'i manuel yükle (bun otomatik .env okur ama test ortamı için override)
const envFile = Bun.file(new URL('.env.test', import.meta.url).pathname)
if (await envFile.exists()) {
  const text = await envFile.text()
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    // Sadece henüz set edilmemişse yükle
    if (!process.env[key]) process.env[key] = val
  }
}

export {}
