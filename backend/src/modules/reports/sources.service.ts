import { SessionModel } from '../../models/session.model.ts'
import type { ReportFilters } from '../../types/index.ts'

function classifySource(referrer?: string, utm?: { source?: string; medium?: string }): string {
  if (utm?.source) return utm.source
  if (!referrer) return '(direct)'

  const url = referrer.toLowerCase()
  if (url.includes('google.') || url.includes('bing.') || url.includes('yahoo.') || url.includes('duckduckgo.')) return 'organic'
  if (url.includes('facebook.') || url.includes('twitter.') || url.includes('instagram.') || url.includes('linkedin.') || url.includes('tiktok.')) return 'social'
  if (url.includes('mail') || url.includes('email')) return 'email'
  return referrer
}

export async function getSources(filters: ReportFilters) {
  const { siteId, from, to } = filters

  const match = { siteId, startedAt: { $gte: from, $lte: to } }

  const [sources, utmCampaigns] = await Promise.all([
    SessionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $cond: [
              { $ne: ['$utm.source', null] },
              '$utm.source',
              {
                $switch: {
                  branches: [
                    { case: { $eq: [{ $type: '$referrer' }, 'missing'] }, then: '(direct)' },
                    { case: { $eq: ['$referrer', null] }, then: '(direct)' },
                    { case: { $eq: ['$referrer', ''] }, then: '(direct)' },
                  ],
                  default: '$referrer',
                },
              },
            ],
          },
          sessions: { $sum: 1 },
        },
      },
      { $project: { _id: 0, source: '$_id', sessions: 1 } },
      { $sort: { sessions: -1 } },
      { $limit: 50 },
    ]),

    // UTM kampanya analizi
    SessionModel.aggregate([
      { $match: { ...match, 'utm.campaign': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            source: '$utm.source',
            medium: '$utm.medium',
            campaign: '$utm.campaign',
          },
          sessions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: '$_id.source',
          medium: '$_id.medium',
          campaign: '$_id.campaign',
          sessions: 1,
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 50 },
    ]),
  ])

  return { sources, utmCampaigns }
}

export async function getReferrers(filters: ReportFilters) {
  const { siteId, from, to, limit = 50 } = filters

  const results = await SessionModel.aggregate([
    {
      $match: {
        siteId,
        startedAt: { $gte: from, $lte: to },
        referrer: { $exists: true, $ne: null, $ne: '' },
      },
    },
    { $group: { _id: '$referrer', sessions: { $sum: 1 } } },
    { $project: { _id: 0, referrer: '$_id', sessions: 1 } },
    { $sort: { sessions: -1 } },
    { $limit: limit },
  ])

  return results
}
