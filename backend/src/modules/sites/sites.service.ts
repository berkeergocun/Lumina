import { customAlphabet } from 'nanoid'
import { SiteModel } from '../../models/site.model.ts'
import { env } from '../../config/env.ts'
import { logger } from '../../shared/logger.ts'

const generateSiteId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]!
    .toLowerCase()
    .trim()
}

function generateTrackerSnippet(siteId: string): string {
  return `<script
  async
  defer
  src="${env.TRACKER_CDN_URL}/tracker.js"
  data-site-id="${siteId}"
></script>`
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function createSite(
  ownerId: string,
  data: { name: string; domain: string; timezone?: string }
) {
  const domain = cleanDomain(data.domain)

  // Aynı kullanıcıdan aynı domain kontrolü
  const existing = await SiteModel.findOne({ ownerId, domain, deletedAt: null })
  if (existing) {
    throw Object.assign(
      new Error('Bu domain için zaten bir site mevcut.'),
      { code: 'DOMAIN_EXISTS', status: 409 }
    )
  }

  const siteId = generateSiteId()
  const verificationToken = `lumina-verification=${crypto.randomUUID()}`

  const site = await SiteModel.create({
    siteId,
    ownerId,
    name: data.name,
    domain,
    timezone: data.timezone ?? 'UTC',
    isVerified: false,
    verificationToken,
  })

  logger.info('Site oluşturuldu', { siteId, domain })

  return formatSite(site)
}

export async function getSitesByOwner(ownerId: string) {
  const sites = await SiteModel.find({ ownerId, deletedAt: null }).sort({ createdAt: -1 })
  return sites.map(formatSite)
}

export async function getSiteById(siteId: string, ownerId: string) {
  const site = await SiteModel.findOne({ siteId, ownerId, deletedAt: null })
  if (!site) {
    throw Object.assign(new Error('Site bulunamadı.'), { code: 'SITE_NOT_FOUND', status: 404 })
  }
  return formatSite(site)
}

export async function updateSite(
  siteId: string,
  ownerId: string,
  data: { name?: string; timezone?: string }
) {
  const site = await SiteModel.findOneAndUpdate(
    { siteId, ownerId, deletedAt: null },
    { $set: data },
    { new: true }
  )
  if (!site) {
    throw Object.assign(new Error('Site bulunamadı.'), { code: 'SITE_NOT_FOUND', status: 404 })
  }
  return formatSite(site)
}

export async function deleteSite(siteId: string, ownerId: string) {
  const site = await SiteModel.findOneAndUpdate(
    { siteId, ownerId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  )
  if (!site) {
    throw Object.assign(new Error('Site bulunamadı.'), { code: 'SITE_NOT_FOUND', status: 404 })
  }
  logger.info('Site silindi', { siteId })
}

export async function verifySite(siteId: string, ownerId: string) {
  const site = await SiteModel.findOne({ siteId, ownerId, deletedAt: null })
  if (!site) {
    throw Object.assign(new Error('Site bulunamadı.'), { code: 'SITE_NOT_FOUND', status: 404 })
  }

  if (site.isVerified) {
    return { verified: true, message: 'Site zaten doğrulanmış.' }
  }

  // Basit DNS / meta kontrolü (üretimde gerçek DNS sorgusu yapılır)
  // Şimdilik mock - gerçek DNS kontrolü için dns.promises.resolveTxt kullanılabilir
  const verified = false // DNS/meta kontrolü yapılacak

  if (verified) {
    await SiteModel.updateOne({ _id: site._id }, { isVerified: true })
    return { verified: true, message: 'Site başarıyla doğrulandı.' }
  }

  return {
    verified: false,
    message: 'Doğrulama başarısız. DNS kaydınızı veya meta etiketinizi kontrol edin.',
    verificationToken: site.verificationToken,
    instructions: {
      dns: `Adınızın TXT kaydına ekleyin: ${site.verificationToken}`,
      meta: `<meta name="lumina-verification" content="${site.verificationToken}">`,
    },
  }
}

export function getSnippet(siteId: string, ownerId: string) {
  return {
    siteId,
    snippet: generateTrackerSnippet(siteId),
    instructions: {
      html: `Head etiketinizin içine yerleştirin.`,
      npm: `// npm ile: bun add @lumina/tracker`,
      spa: `// SPA (React/Vue/Nuxt) desteği otomatikdir.`,
    },
  }
}

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatSite(site: any) {
  return {
    id: site._id.toString(),
    siteId: site.siteId,
    name: site.name,
    domain: site.domain,
    timezone: site.timezone,
    isVerified: site.isVerified,
    verificationToken: site.verificationToken,
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
  }
}
