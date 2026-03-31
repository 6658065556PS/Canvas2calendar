// POST /api/canvas/sync
// Manually triggers a Canvas sync job for a user by enqueuing it via QStash.
// Expects JSON body: { userId: string, courseIds?: number[] }

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { enqueueSyncJob } from '../../src/lib/qstash/client.js'
import type { SyncJobPayload } from '../../src/lib/qstash/client.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, courseIds } = (req.body ?? {}) as Partial<SyncJobPayload>
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const result = await enqueueSyncJob({ userId, courseIds })
    return res.status(200).json({ ok: true, messageId: result.messageId })
  } catch (err) {
    console.error('Failed to enqueue sync job:', err)
    return res.status(500).json({ error: 'Failed to enqueue sync job' })
  }
}
