// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface GeoData {
  country: string
  countryCode: string
  city: string
  region: string
}

export interface DeviceData {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  screenWidth?: number
  screenHeight?: number
}

export interface UTMData {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export type EventType = 'pageview' | 'custom_event' | 'session_start' | 'session_end'

export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ─── JWT Payload ─────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: string       // userId
  email: string
  role: 'owner' | 'viewer'
  type: 'access' | 'refresh'
  jti?: string      // JWT ID (refresh token için)
  iat?: number
  exp?: number
}

// ─── Report Filters ───────────────────────────────────────────────────────────

export interface ReportFilters {
  siteId: string
  from: Date
  to: Date
  granularity?: 'hour' | 'day' | 'week' | 'month'
  limit?: number
  offset?: number
}

// ─── Realtime ─────────────────────────────────────────────────────────────────

export interface RealtimeData {
  activeUsers: number
  activePages: Array<{ url: string; visitors: number }>
  updatedAt: string
}
