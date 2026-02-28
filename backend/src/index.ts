import { env }            from './config/env.ts'
import { connectMongoDB, disconnectMongoDB } from './config/mongodb.ts'
import { getRedis }       from './config/redis.ts'
import { logger }         from './shared/logger.ts'
import { app }            from './app.ts'
import { startFlushWorker,     stopFlushWorker     } from './workers/flush.worker.ts'
import { startAggregateWorker, stopAggregateWorker } from './workers/aggregate.worker.ts'
import { startCleanupWorker,   stopCleanupWorker   } from './workers/cleanup.worker.ts'

async function bootstrap() {
  logger.info('SmartAnalytics backend başlatılıyor…')

  // 1. Veritabanı bağlantıları
  await connectMongoDB()
  getRedis() // singleton: bağlantıyı initialize et
  logger.info('Veritabanı bağlantıları kuruldu.')

  // 2. Background worker'ları başlat
  startFlushWorker()
  startAggregateWorker()
  startCleanupWorker()

  // 3. HTTP sunucuyu başlat
  app.listen({ port: env.PORT, hostname: '0.0.0.0' }, ({ hostname, port }) => {
    logger.info(`Sunucu çalışıyor → http://${hostname}:${port}`)
    logger.info(`Swagger UI      → http://${hostname}:${port}/docs`)
  })

  // 4. Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} alındı, kapatılıyor…`)
    stopFlushWorker()
    stopAggregateWorker()
    stopCleanupWorker()
    await disconnectMongoDB()
    const redis = getRedis()
    await redis.quit()
    process.exit(0)
  }

  process.on('SIGINT',  () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

bootstrap().catch(err => {
  logger.error('Bootstrap hatası:', { message: err.message, stack: err.stack })
  process.exit(1)
})
