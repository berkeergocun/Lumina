import { EventModel } from '../../models/event.model.ts'
import { SessionModel } from '../../models/session.model.ts'
import type { ReportFilters } from '../../types/index.ts'

export async function getPages(filters: ReportFilters) {
  const { siteId, from, to, limit = 50, offset = 0 } = filters

  const match = { siteId, type: 'pageview', timestamp: { $gte: from, $lte: to }, isBot: false }

  const [results, total] = await Promise.all([
    EventModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$url',
          pageviews: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          url: '$_id',
          pageviews: 1,
          uniqueVisitors: { $size: '$uniqueSessions' },
        },
      },
      { $sort: { pageviews: -1 } },
      { $skip: offset },
      { $limit: limit },
    ]),
    EventModel.aggregate([
      { $match: match },
      { $group: { _id: '$url' } },
      { $count: 'total' },
    ]).then(r => r[0]?.total ?? 0),
  ])

  return { pages: results, total }
}

export async function getExitPages(filters: ReportFilters) {
  const { siteId, from, to, limit = 20 } = filters

  const results = await SessionModel.aggregate([
    { $match: { siteId, startedAt: { $gte: from, $lte: to }, exitUrl: { $exists: true, $ne: null } } },
    { $group: { _id: '$exitUrl', exits: { $sum: 1 } } },
    { $project: { _id: 0, url: '$_id', exits: 1 } },
    { $sort: { exits: -1 } },
    { $limit: limit },
  ])

  return results
}
