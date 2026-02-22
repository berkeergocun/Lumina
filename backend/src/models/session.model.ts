import { Schema, model, type Document, type Types } from 'mongoose'

export interface ISession extends Document {
  _id: Types.ObjectId
  sessionId: string
  siteId: string
  startedAt: Date
  endedAt?: Date
  duration: number
  pageviews: number
  isBounce: boolean
  entryUrl: string
  exitUrl?: string
  geo: {
    country: string
    countryCode: string
    city: string
  }
  device: {
    type: string
    browser: string
    os: string
  }
  referrer?: string
  utm: {
    source?: string
    medium?: string
    campaign?: string
  }
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    siteId: { type: String, required: true },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 },
    pageviews: { type: Number, default: 1 },
    isBounce: { type: Boolean, default: true },
    entryUrl: { type: String, required: true },
    exitUrl: { type: String },
    geo: {
      country: { type: String, default: 'Unknown' },
      countryCode: { type: String, default: 'XX' },
      city: { type: String, default: 'Unknown' },
    },
    device: {
      type: { type: String, default: 'unknown' },
      browser: { type: String, default: 'Unknown' },
      os: { type: String, default: 'Unknown' },
    },
    referrer: { type: String },
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
  },
  {
    versionKey: false,
  }
)

sessionSchema.index({ siteId: 1, startedAt: -1 })
sessionSchema.index({ siteId: 1, 'geo.country': 1 })
// 2 yıllık TTL
sessionSchema.index({ startedAt: 1 }, { expireAfterSeconds: 63072000 })

export const SessionModel = model<ISession>('Session', sessionSchema)
