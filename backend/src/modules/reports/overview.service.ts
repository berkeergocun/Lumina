import { EventModel } from '../../models/event.model.ts'
import { SessionModel } from '../../models/session.model.ts'
import type { ReportFilters } from '../../types/index.ts'

export async function getOverview(filters: ReportFilters) {
  const { siteId, from, to } = filters

  const matchStage = {
    siteId,
    timestamp: { $gte: from, $lte: to },
    isBot: false,
  }

  const [eventStats, sessionStats] = await Promise.all([
    // Sayfa görüntüleme sayısı
    EventModel.aggregate([
      { $match: { ...matchStage, type: 'pageview' } },
      {
        $group: {
          _id: null,
          pageviews: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          pageviews: 1,
          uniqueVisitors: { $size: '$uniqueSessions' },
        },
      },
    ]),

    // Oturum istatistikleri
    SessionModel.aggregate([
      { $match: { siteId, startedAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
          totalDuration: { $sum: '$duration' },
        },
      },
      {
        $project: {
          _id: 0,
          sessions: 1,
          bounceRate: {
            $cond: [
              { $eq: ['$sessions', 0] },
              0,
              { $multiply: [{ $divide: ['$bounces', '$sessions'] }, 100] },
            ],
          },
          avgSessionDuration: {
            $cond: [
              { $eq: ['$sessions', 0] },
              0,
              { $divide: ['$totalDuration', '$sessions'] },
            ],
          },
        },
      },
    ]),
  ])

  const ev = eventStats[0] ?? { pageviews: 0, uniqueVisitors: 0 }
  const ss = sessionStats[0] ?? { sessions: 0, bounceRate: 0, avgSessionDuration: 0 }

  return {
    pageviews: ev.pageviews,
    uniqueVisitors: ev.uniqueVisitors,
    sessions: ss.sessions,
    bounceRate: Math.round(ss.bounceRate * 100) / 100,
    avgSessionDuration: Math.round(ss.avgSessionDuration),
  }
}
