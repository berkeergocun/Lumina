import { getRealtimeData } from '../collect/collect.service.ts'
import { env } from '../../config/env.ts'

export async function createSSEStream(siteId: string): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  let interval: ReturnType<typeof setInterval> | null = null

  return new ReadableStream({
    start(controller) {
      // İlk veriyi hemen gönder
      const send = async () => {
        try {
          const data = await getRealtimeData(siteId)
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch (err) {
          controller.enqueue(encoder.encode(`data: {"error":"stream_error"}\n\n`))
        }
      }

      send()
      interval = setInterval(send, env.REALTIME_UPDATE_INTERVAL)
    },
    cancel() {
      if (interval) clearInterval(interval)
    },
  })
}
