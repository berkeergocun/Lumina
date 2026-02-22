import { Schema, model, type Document, type Types } from 'mongoose'

export interface IDailyAggregate extends Document {
  _id: Types.ObjectId
  siteId: string
  date: Date
  pageviews: number
  sessions: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  byPage: Array<{ url: string; views: number }>
  byCountry: Array<{ code: string; name: string; sessions: number }>
  bySource: Array<{ source: string; sessions: number }>
  byDevice: Array<{ type: string; sessions: number }>
  byBrowser: Array<{ name: string; sessions: number }>
  byOs: Array<{ name: string; sessions: number }>
}

const dailyAggregateSchema = new Schema<IDailyAggregate>(
  {
    siteId: { type: String, required: true },
    date: { type: Date, required: true },
    pageviews: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    byPage: [{ url: String, views: Number }],
    byCountry: [{ code: String, name: String, sessions: Number }],
    bySource: [{ source: String, sessions: Number }],
    byDevice: [{ type: String, sessions: Number }],
    byBrowser: [{ name: String, sessions: Number }],
    byOs: [{ name: String, sessions: Number }],
  },
  {
    versionKey: false,
  }
)

dailyAggregateSchema.index({ siteId: 1, date: -1 }, { unique: true })

export const DailyAggregateModel = model<IDailyAggregate>('DailyAggregate', dailyAggregateSchema)
