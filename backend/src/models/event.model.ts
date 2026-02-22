import { Schema, model, type Document, type Types } from 'mongoose'
import type { GeoData, DeviceData, UTMData, EventType } from '../types/index.ts'

export interface IEvent extends Document {
  _id: Types.ObjectId
  siteId: string
  sessionId: string
  type: EventType
  name?: string
  properties?: Record<string, string | number>
  url: string
  referrer?: string
  utm: UTMData
  geo: GeoData
  device: DeviceData
  timestamp: Date
  isBot: boolean
}

const eventSchema = new Schema<IEvent>(
  {
    siteId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['pageview', 'custom_event', 'session_start', 'session_end'],
      required: true,
    },
    name: { type: String },
    properties: { type: Schema.Types.Mixed },
    url: { type: String, required: true },
    referrer: { type: String },
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String,
    },
    geo: {
      country: { type: String, default: 'Unknown' },
      countryCode: { type: String, default: 'XX' },
      city: { type: String, default: 'Unknown' },
      region: { type: String, default: 'Unknown' },
    },
    device: {
      browser: { type: String, default: 'Unknown' },
      browserVersion: { type: String },
      os: { type: String, default: 'Unknown' },
      osVersion: { type: String },
      type: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' },
      screenWidth: Number,
      screenHeight: Number,
    },
    timestamp: { type: Date, required: true, default: Date.now },
    isBot: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    // _id otomatik oluşur, timestamps kullanmıyoruz çünkü timestamp alanı var
  }
)

// Sorgu indeksleri
eventSchema.index({ siteId: 1, timestamp: -1 })
eventSchema.index({ siteId: 1, type: 1, timestamp: -1 })
eventSchema.index({ siteId: 1, 'utm.source': 1, timestamp: -1 })

// 2 yıllık TTL (63072000 saniye)
eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 })

export const EventModel = model<IEvent>('Event', eventSchema)
