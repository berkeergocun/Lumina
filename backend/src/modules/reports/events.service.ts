import { EventModel } from '../../models/event.model.ts'
import type { ReportFilters } from '../../types/index.ts'

export async function getCustomEvents(filters: ReportFilters) {
  const { siteId, from, to, limit = 50, offset = 0 } = filters

  const match = {
    siteId,
    type: 'custom_event',
    timestamp: { $gte: from, $lte: to },
    isBot: false,
  }

  const [events, total] = await Promise.all([
    EventModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
          firstSeen: { $min: '$timestamp' },
          lastSeen: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueSessions' },
          firstSeen: 1,
          lastSeen: 1,
        },
      },
      { $sort: { count: -1 } },
      { $skip: offset },
      { $limit: limit },
    ]),
    EventModel.aggregate([
      { $match: match },
      { $group: { _id: '$name' } },
      { $count: 'total' },
    ]).then(r => r[0]?.total ?? 0),
  ])

  return { events, total }
}

export async function getEventProperties(
  siteId: string,
  eventName: string,
  from: Date,
  to: Date
) {
  const results = await EventModel.aggregate([
    {
      $match: {
        siteId,
        type: 'custom_event',
        name: eventName,
        timestamp: { $gte: from, $lte: to },
        isBot: false,
        properties: { $exists: true, $ne: null },
      },
    },
    { $project: { properties: 1 } },
    { $limit: 1000 }, // Max 1000 örnek
  ])

  // Property dağılımı
  const propertyMap: Record<string, Record<string, number>> = {}
  for (const doc of results) {
    for (const [key, value] of Object.entries(doc.properties ?? {})) {
      if (!propertyMap[key]) propertyMap[key] = {}
      const v = String(value)
      propertyMap[key]![v] = (propertyMap[key]![v] ?? 0) + 1
    }
  }

  return Object.entries(propertyMap).map(([property, values]) => ({
    property,
    values: Object.entries(values)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
  }))
}
