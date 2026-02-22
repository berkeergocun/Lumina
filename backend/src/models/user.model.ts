import { Schema, model, type Document, type Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  passwordHash: string
  name: string
  role: 'owner' | 'viewer'
  isVerified: boolean
  verificationToken?: string
  passwordResetToken?: string
  passwordResetExpiry?: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['owner', 'viewer'], default: 'owner' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

userSchema.index({ verificationToken: 1 })
userSchema.index({ passwordResetToken: 1 })

export const UserModel = model<IUser>('User', userSchema)
