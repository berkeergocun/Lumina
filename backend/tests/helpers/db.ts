/**
 * tests/helpers/db.ts
 * Entegrasyon testleri için MongoDB ve Redis bağlantı yardımcıları.
 */
import mongoose from 'mongoose'
import { afterAll, beforeAll } from 'bun:test'

export async function connectTestDB() {
  const uri = process.env.MONGODB_URI!
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
}

export async function disconnectTestDB() {
  await mongoose.disconnect()
}

export async function clearCollections(...names: string[]) {
  const db = mongoose.connection.db!
  for (const name of names) {
    try {
      await db.collection(name).deleteMany({})
    } catch {
      // Koleksiyon henüz oluşturulmamış olabilir
    }
  }
}

/** Integration testleri için Elysia app'ini import et (handle ile test et) */
export async function getTestApp() {
  const { app } = await import('../../src/app.ts')
  return app
}
