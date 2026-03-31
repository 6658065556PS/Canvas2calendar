// POST /api/webhooks/canvas
// Canvas Live Events webhook receiver.
// Canvas sends events here when assignments are created/updated.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { enqueueSyncJob } from '../../src/lib/qstash/client.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verify the shared webhook secret
  const authHeader = req.headers['authorization'] ?? ''
  const expected = `Bearer ${process.env.CANVAS_WEBHOOK_SECRET}`
  if (authHeader !== expected) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const event = req.body as {
    metadata?: { event_name?: string; user_id?: string }
  }
  const eventName = event?.metadata?.event_name
  const userId = event?.metadata?.user_id

  console.log(`Canvas webhook received: ${eventName}`)

  // Re-sync the affected user on assignment changes
  if (
    userId &&
    eventName &&
    ['assignment_created', 'assignment_updated', 'assignment_deleted'].includes(eventName)
  ) {
    try {
      await enqueueSyncJob({ userId })
    } catch (err) {
      console.error('Failed to enqueue re-sync from webhook:', err)
    }
  }

  return res.status(200).json({ ok: true })
}
