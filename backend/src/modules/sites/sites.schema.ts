import { t } from 'elysia'

export const CreateSiteBody = t.Object({
  name: t.String({ minLength: 2, maxLength: 100 }),
  domain: t.String({ minLength: 3, maxLength: 255 }),
  timezone: t.Optional(t.String({ default: 'UTC' })),
})

export const UpdateSiteBody = t.Object({
  name: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
  timezone: t.Optional(t.String()),
})

export const SiteIdParam = t.Object({
  siteId: t.String({ minLength: 12, maxLength: 12 }),
})

export const VerifySiteBody = t.Object({
  method: t.Union([t.Literal('dns'), t.Literal('meta')]),
})
