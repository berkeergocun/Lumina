import { SessionModel } from '../../models/session.model.ts'
import type { ReportFilters } from '../../types/index.ts'

export async function getGeo(filters: ReportFilters) {
  const { siteId, from, to } = filters

  const match = { siteId, startedAt: { $gte: from, $lte: to } }

  const [countries, cities] = await Promise.all([
    SessionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { code: '$geo.countryCode', name: '$geo.country' },
          sessions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          countryCode: '$_id.code',
          country: '$_id.name',
          sessions: 1,
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 100 },
    ]),

    SessionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { city: '$geo.city', country: '$geo.country', code: '$geo.countryCode' },
          sessions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          countryCode: '$_id.code',
          sessions: 1,
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 50 },
    ]),
  ])

  return { countries, cities }
}
