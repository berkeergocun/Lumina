import bcrypt from 'bcryptjs'
import { UserModel } from '../../models/user.model.ts'
import { redis } from '../../config/redis.ts'
import { env } from '../../config/env.ts'
import { logger } from '../../shared/logger.ts'
import type { JWTPayload } from '../../types/index.ts'

const BCRYPT_ROUNDS = 12
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 gün

// ─── Yardımcılar ────────────────────────────────────────────────────────────

function generateJTI(): string {
  return crypto.randomUUID()
}

// ─── Servis ─────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  name: string
  email: string
  password: string
}) {
  const existing = await UserModel.findOne({ email: data.email.toLowerCase() })
  if (existing) {
    throw Object.assign(new Error('Bu e-posta adresi zaten kayıtlı.'), { code: 'EMAIL_ALREADY_EXISTS', status: 409 })
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)
  const verificationToken = crypto.randomUUID()

  const user = await UserModel.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: 'owner',
    isVerified: false,
    verificationToken,
  })

  logger.info('Yeni kullanıcı kaydoldu', { userId: user._id.toString() })

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  }
}

export async function loginUser(
  data: { email: string; password: string },
  jwtSign: (payload: JWTPayload) => Promise<string>
) {
  const user = await UserModel.findOne({ email: data.email.toLowerCase() })
  if (!user) {
    throw Object.assign(new Error('E-posta veya şifre hatalı.'), { code: 'INVALID_CREDENTIALS', status: 401 })
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash)
  if (!isValid) {
    throw Object.assign(new Error('E-posta veya şifre hatalı.'), { code: 'INVALID_CREDENTIALS', status: 401 })
  }

  const jti = generateJTI()

  const accessToken = await jwtSign({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    type: 'access',
  })

  const refreshToken = await jwtSign({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    type: 'refresh',
    jti,
  })

  // Refresh token'ı Redis'te sakla
  await redis.setex(`refresh:${jti}`, REFRESH_TTL_SECONDS, user._id.toString())

  logger.info('Kullanıcı giriş yaptı', { userId: user._id.toString() })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  }
}

export async function refreshAccessToken(
  refreshToken: string,
  jwtVerify: (token: string) => Promise<JWTPayload | false>,
  jwtSign: (payload: JWTPayload) => Promise<string>
) {
  const payload = await jwtVerify(refreshToken)
  if (!payload || payload.type !== 'refresh') {
    throw Object.assign(new Error('Geçersiz refresh token.'), { code: 'INVALID_TOKEN', status: 401 })
  }

  // Kara liste kontrolü
  if (payload.jti) {
    const blacklisted = await redis.get(`blacklist:token:${payload.jti}`)
    if (blacklisted) {
      throw Object.assign(new Error('Token iptal edilmiş.'), { code: 'TOKEN_REVOKED', status: 401 })
    }

    // Redis'ten geçerliliği kontrol et
    const stored = await redis.get(`refresh:${payload.jti}`)
    if (!stored) {
      throw Object.assign(new Error('Refresh token süresi dolmuş.'), { code: 'TOKEN_EXPIRED', status: 401 })
    }

    // Eski token'ı kara listeye al (rotasyon)
    await redis.del(`refresh:${payload.jti}`)
    await redis.setex(`blacklist:token:${payload.jti}`, REFRESH_TTL_SECONDS, '1')
  }

  const newJti = generateJTI()
  const newAccessToken = await jwtSign({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    type: 'access',
  })

  const newRefreshToken = await jwtSign({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    type: 'refresh',
    jti: newJti,
  })

  await redis.setex(`refresh:${newJti}`, REFRESH_TTL_SECONDS, payload.sub)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export async function logoutUser(jti?: string) {
  if (jti) {
    await redis.del(`refresh:${jti}`)
    await redis.setex(`blacklist:token:${jti}`, REFRESH_TTL_SECONDS, '1')
  }
}

export async function forgotPassword(email: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() })
  if (!user) {
    // Güvenlik: kullanıcı bulunamasa da başarı mesajı dön
    return
  }

  const token = crypto.randomUUID()
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 saat

  await UserModel.updateOne(
    { _id: user._id },
    { passwordResetToken: token, passwordResetExpiry: expiry }
  )

  // TODO: E-posta gönder
  logger.info('Şifre sıfırlama talebi', { userId: user._id.toString(), token })
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await UserModel.findOne({
    passwordResetToken: token,
    passwordResetExpiry: { $gt: new Date() },
  })

  if (!user) {
    throw Object.assign(new Error('Geçersiz veya süresi dolmuş token.'), { code: 'INVALID_TOKEN', status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  await UserModel.updateOne(
    { _id: user._id },
    {
      passwordHash,
      $unset: { passwordResetToken: '', passwordResetExpiry: '' },
    }
  )

  logger.info('Şifre sıfırlandı', { userId: user._id.toString() })
}

export async function verifyEmail(token: string) {
  const user = await UserModel.findOneAndUpdate(
    { verificationToken: token },
    { isVerified: true, $unset: { verificationToken: '' } },
    { new: true }
  )

  if (!user) {
    throw Object.assign(new Error('Geçersiz doğrulama token\'ı.'), { code: 'INVALID_TOKEN', status: 400 })
  }

  logger.info('E-posta doğrulandı', { userId: user._id.toString() })
}
