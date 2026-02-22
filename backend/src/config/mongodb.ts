import mongoose from 'mongoose'
import { env } from './env.ts'

let isConnected = false

export async function connectMongoDB(): Promise<void> {
  if (isConnected) return

  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    })

    isConnected = true
    console.log('✅ MongoDB bağlantısı kuruldu')

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB bağlantısı kesildi')
      isConnected = false
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB hatası:', err)
      isConnected = false
    })
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error)
    throw error
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
  console.log('🔌 MongoDB bağlantısı kapatıldı')
}

export { mongoose }
