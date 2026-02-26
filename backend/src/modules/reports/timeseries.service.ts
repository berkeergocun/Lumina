import { EventModel } from '../../models/event.model.ts'
import type { ReportFilters } from '../../types/index.ts'

type Granularity = 'hour' | 'day' | 'week' | 'month'

function getDateTrunc(granularity: Granularity) {
  switch (granularity) {
    case 'hour':
      return { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' }, hour: { $hour: '$timestamp' } }
    case 'day':
      return { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } }
    case 'week':
      return { year: { $isoWeekYear: '$timestamp' }, week: { $isoWeek: '$timestamp' } }
    case 'month':
      return { year: { $year: '$timestamp' }, month: { $month: '$timestamp' } }
  }
}

export async function getTimeseries(filters: ReportFilters) {
  const { siteId, from, to, granularity = 'day' } = filters

  const results = await EventModel.aggregate([
    {
      $match: {
        siteId,
        type: 'pageview',
        timestamp: { $gte: from, $lte: to },
        isBot: false,
      },
    },
    {
      $group: {
        _id: getDateTrunc(granularity),
        pageviews: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
      },
    },
    {
      $project: {
        _id: 0,
        period: '$_id',
        pageviews: 1,
        visitors: { $size: '$uniqueSessions' },
      },
    },
    { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.hour': 1 } },
  ])

  return results.map((r) => ({
    period: r.period,
    pageviews: r.pageviews,
    visitors: r.visitors,
  }))
}
