import Elysia from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { env } from '../../config/env.ts'
import { redis } from '../../config/redis.ts'
import type { JWTPayload } from '../../types/index.ts'

// Access token JWT plugin
export const accessJWT = new Elysia({ name: 'access-jwt' }).use(
  jwt({
    name: 'accessJWT',
    secret: env.JWT_ACCESS_SECRET,
    exp: env.JWT_ACCESS_EXPIRY,
  })
)

// Refresh token JWT plugin
export const refreshJWT = new Elysia({ name: 'refresh-jwt' }).use(
  jwt({
    name: 'refreshJWT',
    secret: env.JWT_REFRESH_SECRET,
    exp: env.JWT_REFRESH_EXPIRY,
  })
)

/**
 * Kimlik doğrulama middleware'i.
 * Authorization: Bearer <token> başlığından token'ı alır ve doğrular.
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(accessJWT)
  .derive({ as: 'global' }, async ({ accessJWT, headers, error }) => {
    const authHeader = headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null }
    }

    const token = authHeader.slice(7)
    const payload = await accessJWT.verify(token) as JWTPayload | false

    if (!payload || payload.type !== 'access') {
      return { user: null }
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        jti: payload.jti,
      },
    }
  })

/**
 * Oturum açılmış kullanıcı gerektiren guard.
 */
export function requireAuth() {
  return new Elysia({ name: 'require-auth' })
    .use(authMiddleware)
    .onBeforeHandle(({ user, error }) => {
      if (!user) {
        return error(401, {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bu işlem için giriş yapmanız gerekiyor.' },
        })
      }
    })
}

/**
 * Owner rolü gerektiren guard.
 */
export function requireOwner() {
  return new Elysia({ name: 'require-owner' })
    .use(authMiddleware)
    .onBeforeHandle(({ user, error }) => {
      if (!user) {
        return error(401, {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Bu işlem için giriş yapmanız gerekiyor.' },
        })
      }
      if (user.role !== 'owner') {
        return error(403, {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz yok.' },
        })
      }
    })
}
