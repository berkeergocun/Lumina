import { t } from 'elysia'

export const RegisterBody = t.Object({
  name: t.String({ minLength: 2, maxLength: 100 }),
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8, maxLength: 128 }),
})

export const LoginBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 1 }),
})

export const ForgotPasswordBody = t.Object({
  email: t.String({ format: 'email' }),
})

export const ResetPasswordBody = t.Object({
  token: t.String({ minLength: 1 }),
  password: t.String({ minLength: 8, maxLength: 128 }),
})

export const RefreshBody = t.Object({
  refreshToken: t.String({ minLength: 1 }),
})
