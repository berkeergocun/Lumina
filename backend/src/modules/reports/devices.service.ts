import { SessionModel } from '../../models/session.model.ts'
import { EventModel } from '../../models/event.model.ts'
import type { ReportFilters } from '../../types/index.ts'

export async function getDevices(filters: ReportFilters) {
  const { siteId, from, to } = filters

  const match = { siteId, startedAt: { $gte: from, $lte: to } }

  const [deviceTypes, browsers, operatingSystems, screens] = await Promise.all([
    // Cihaz tipi dağılımı
    SessionModel.aggregate([
      { $match: match },
      { $group: { _id: '$device.type', sessions: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', sessions: 1 } },
      { $sort: { sessions: -1 } },
    ]),

    // Tarayıcı dağılımı
    SessionModel.aggregate([
      { $match: match },
      { $group: { _id: '$device.browser', sessions: { $sum: 1 } } },
      { $project: { _id: 0, browser: '$_id', sessions: 1 } },
      { $sort: { sessions: -1 } },
      { $limit: 20 },
    ]),

    // İşletim sistemi dağılımı
    SessionModel.aggregate([
      { $match: match },
      { $group: { _id: '$device.os', sessions: { $sum: 1 } } },
      { $project: { _id: 0, os: '$_id', sessions: 1 } },
      { $sort: { sessions: -1 } },
      { $limit: 20 },
    ]),

    // Ekran çözünürlüğü
    EventModel.aggregate([
      {
        $match: {
          siteId,
          type: 'pageview',
          timestamp: { $gte: from, $lte: to },
          isBot: false,
          'device.screenWidth': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            width: '$device.screenWidth',
            height: '$device.screenHeight',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          resolution: { $concat: [{ $toString: '$_id.width' }, 'x', { $toString: '$_id.height' }] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
  ])

  return { deviceTypes, browsers, operatingSystems, screens }
}
