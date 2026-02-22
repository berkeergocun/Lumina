import { UAParser } from 'ua-parser-js'
import type { DeviceData } from '../types/index.ts'

export function parseUserAgent(ua: string): DeviceData {
  if (!ua) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      type: 'unknown',
    }
  }

  const parser = new UAParser(ua)
  const result = parser.getResult()

  const deviceType = result.device?.type
  let type: DeviceData['type'] = 'desktop'
  if (deviceType === 'mobile') type = 'mobile'
  else if (deviceType === 'tablet') type = 'tablet'
  else if (!deviceType) type = 'desktop'
  else type = 'unknown'

  return {
    browser: result.browser?.name ?? 'Unknown',
    browserVersion: result.browser?.version ?? '',
    os: result.os?.name ?? 'Unknown',
    osVersion: result.os?.version ?? '',
    type,
  }
}
