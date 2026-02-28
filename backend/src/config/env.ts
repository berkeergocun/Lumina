import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  APP_URL: z.string().url().default('http://localhost:3001'),
  DASHBOARD_URL: z.string().url().default('http://localhost:3000'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI gerekli'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL gerekli'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET en az 32 karakter olmalı'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET en az 32 karakter olmalı'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@lumina.io'),

  // GeoIP
  MAXMIND_DB_PATH: z.string().default('./data/GeoLite2-City.mmdb'),
  GEOIP_ENABLED: z.string().transform(v => v === 'true').default('false'),

  // Cache
  REPORT_CACHE_TTL: z.coerce.number().default(300),
  REALTIME_UPDATE_INTERVAL: z.coerce.number().default(5000),

  // CDN
  TRACKER_CDN_URL: z.string().default('http://localhost:3001'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
})

type Env = z.infer<typeof envSchema>

let _env: Env | undefined

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
      console.error('❌ Ortam değişkeni hatası:')
      result.error.issues.forEach(issue => {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`)
      })
      process.exit(1)
    }
    _env = result.data
  }
  return _env
}

export const env = getEnv()
