import { env } from '../config/env.ts'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  }

  if (env.NODE_ENV === 'production') {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      JSON.stringify(entry)
    )
  } else {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    }
    const reset = '\x1b[0m'
    const prefix = `${colors[level]}[${level.toUpperCase()}]${reset} ${entry.timestamp}`
    if (data) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `${prefix} ${message}`,
        data
      )
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `${prefix} ${message}`
      )
    }
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, data),
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
}
