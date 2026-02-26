import { t } from 'elysia'

export const CollectBody = t.Object({
  siteId: t.String({ minLength: 12, maxLength: 12 }),
  sessionId: t.String({ minLength: 36, maxLength: 36 }),
  type: t.Union([
    t.Literal('pageview'),
    t.Literal('custom_event'),
    t.Literal('session_start'),
    t.Literal('session_end'),
  ]),
  url: t.String({ minLength: 1, maxLength: 2048 }),
  name: t.Optional(t.String({ maxLength: 64, pattern: '^[a-zA-Z0-9_-]+$' })),
  properties: t.Optional(
    t.Record(
      t.String({ maxLength: 64 }),
      t.Union([t.String({ maxLength: 256 }), t.Number()])
    )
  ),
  referrer: t.Optional(t.String({ maxLength: 2048 })),
  utm: t.Optional(
    t.Object({
      source: t.Optional(t.String({ maxLength: 256 })),
      medium: t.Optional(t.String({ maxLength: 256 })),
      campaign: t.Optional(t.String({ maxLength: 256 })),
      term: t.Optional(t.String({ maxLength: 256 })),
      content: t.Optional(t.String({ maxLength: 256 })),
    })
  ),
  screen: t.Optional(
    t.Object({
      width: t.Optional(t.Number()),
      height: t.Optional(t.Number()),
    })
  ),
  language: t.Optional(t.String({ maxLength: 10 })),
  timestamp: t.Optional(t.String()),
})
