import { Schema, model, type Document, type Types } from 'mongoose'

export interface ISite extends Document {
  _id: Types.ObjectId
  siteId: string
  ownerId: Types.ObjectId
  name: string
  domain: string
  timezone: string
  isVerified: boolean
  verificationToken: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

const siteSchema = new Schema<ISite>(
  {
    siteId: { type: String, required: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, lowercase: true, trim: true },
    timezone: { type: String, default: 'UTC' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

siteSchema.index({ ownerId: 1 })
siteSchema.index({ domain: 1 })
siteSchema.index({ siteId: 1, deletedAt: 1 })

export const SiteModel = model<ISite>('Site', siteSchema)
