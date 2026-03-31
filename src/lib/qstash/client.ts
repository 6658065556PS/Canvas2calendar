// Upstash QStash job queue client
// Used server-side only (Vercel API routes) — never import from frontend code.

import { Client } from '@upstash/qstash'

export interface SyncJobPayload {
  userId: string
  courseIds?: number[]
}

function getQStashClient() {
  const token = process.env.QSTASH_TOKEN
  if (!token) throw new Error('QSTASH_TOKEN is not set')
  return new Client({ token })
}

function getAppUrl(): string {
  // VERCEL_URL is automatically set by Vercel (no https://)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  // Explicit override for production custom domain
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL
  return 'http://localhost:5173'
}

export async function enqueueSyncJob(payload: SyncJobPayload) {
  const qstash = getQStashClient()
  return qstash.publishJSON({
    url: `${getAppUrl()}/api/qstash`,
    body: payload,
    retries: 3,
  })
}

export async function scheduleRecurringSync(
  payload: SyncJobPayload,
  cron = '0 7 * * *',
): Promise<string> {
  const qstash = getQStashClient()
  const result = await qstash.schedules.create({
    destination: `${getAppUrl()}/api/qstash`,
    cron,
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  })
  return result.scheduleId
}
