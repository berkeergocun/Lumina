import Elysia from 'elysia'
import { accessJWT, refreshJWT, authMiddleware } from './auth.middleware.ts'
import * as authService from './auth.service.ts'
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  RefreshBody,
} from './auth.schema.ts'
import type { JWTPayload } from '../../types/index.ts'

export const authRoutes = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .use(accessJWT)
  .use(refreshJWT)

  // POST /auth/register
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        const user = await authService.registerUser(body)
        return { success: true, data: { user } }
      } catch (err: any) {
        set.status = err.status ?? 400
        return {
          success: false,
          error: { code: err.code ?? 'REGISTER_FAILED', message: err.message },
        }
      }
    },
    {
      body: RegisterBody,
      detail: {
        summary: 'Kullanıcı kaydı',
        description: 'Yeni kullanıcı hesabı oluşturur.',
      },
    }
  )

  // POST /auth/login
  .post(
    '/login',
    async ({ body, accessJWT, set }) => {
      try {
        const result = await authService.loginUser(body, (p) =>
          accessJWT.sign(p as Record<string, unknown>)
        )
        return { success: true, data: result }
      } catch (err: any) {
        set.status = err.status ?? 401
        return {
          success: false,
          error: { code: err.code ?? 'LOGIN_FAILED', message: err.message },
        }
      }
    },
    {
      body: LoginBody,
      detail: { summary: 'Kullanıcı girişi' },
    }
  )

  // POST /auth/refresh
  .post(
    '/refresh',
    async ({ body, refreshJWT, accessJWT, set }) => {
      try {
        const result = await authService.refreshAccessToken(
          body.refreshToken,
          (t) => refreshJWT.verify(t) as Promise<JWTPayload | false>,
          (p) => accessJWT.sign(p as Record<string, unknown>)
        )
        return { success: true, data: result }
      } catch (err: any) {
        set.status = err.status ?? 401
        return {
          success: false,
          error: { code: err.code ?? 'REFRESH_FAILED', message: err.message },
        }
      }
    },
    {
      body: RefreshBody,
      detail: { summary: 'Token yenileme' },
    }
  )

  // POST /auth/logout
  .post(
    '/logout',
    async ({ body, refreshJWT }) => {
      try {
        const payload = await refreshJWT.verify((body as any).refreshToken ?? '') as JWTPayload | false
        await authService.logoutUser(payload ? payload.jti : undefined)
      } catch {}
      return { success: true, data: { message: 'Başarıyla çıkış yapıldı.' } }
    },
    {
      body: RefreshBody,
      detail: { summary: 'Çıkış' },
    }
  )

  // POST /auth/forgot-password
  .post(
    '/forgot-password',
    async ({ body }) => {
      await authService.forgotPassword(body.email)
      return {
        success: true,
        data: { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' },
      }
    },
    {
      body: ForgotPasswordBody,
      detail: { summary: 'Şifre sıfırlama isteği' },
    }
  )

  // POST /auth/reset-password
  .post(
    '/reset-password',
    async ({ body, set }) => {
      try {
        await authService.resetPassword(body.token, body.password)
        return { success: true, data: { message: 'Şifreniz başarıyla güncellendi.' } }
      } catch (err: any) {
        set.status = err.status ?? 400
        return {
          success: false,
          error: { code: err.code ?? 'RESET_FAILED', message: err.message },
        }
      }
    },
    {
      body: ResetPasswordBody,
      detail: { summary: 'Şifre sıfırlama' },
    }
  )

  // POST /auth/verify-email
  .post(
    '/verify-email',
    async ({ body, set }) => {
      try {
        await authService.verifyEmail((body as any).token)
        return { success: true, data: { message: 'E-posta adresiniz doğrulandı.' } }
      } catch (err: any) {
        set.status = err.status ?? 400
        return {
          success: false,
          error: { code: err.code ?? 'VERIFY_FAILED', message: err.message },
        }
      }
    },
    {
      detail: { summary: 'E-posta doğrulama' },
    }
  )
