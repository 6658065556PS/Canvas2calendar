// POST /api/canvas/ical-sync
// Syncs Canvas assignments from a bCourses iCal calendar feed URL.
// No API token required — users just paste their public feed URL.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServerSupabaseClient } from '../../src/lib/supabase-server.js'
import { insertEnrichedAssignment } from '../../src/lib/canvas/pipeline.js'

// ── ICS parser ─────────────────────────────────────────────────────────────

/** Unfold RFC 5545 line continuations (CRLF + whitespace → single line) */
function unfoldLines(ics: string): string {
  return ics.replace(/\r?\n[ \t]/g, '')
}

interface IcsEvent {
  summary: string
  dtstart: string
  url: string
  description: string
  uid: string
}

function parseIcs(icsText: string): IcsEvent[] {
  const unfolded = unfoldLines(icsText)
  const events: IcsEvent[] = []
  const blocks = unfolded.split('BEGIN:VEVENT')

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]

    const get = (key: string): string => {
      // Matches KEY, KEY;PARAM=value, KEY;TZID=..., etc.
      const match = block.match(new RegExp(`^${key}(?:;[^:\\r\\n]*)?:([^\\r\\n]*)`, 'm'))
      return match ? match[1].trim() : ''
    }

    const url = get('URL')
    // Only process assignment events (skip course events, announcements)
    if (!url.includes('/assignments/')) continue

    events.push({
      summary: get('SUMMARY'),
      dtstart: get('DTSTART'),
      url,
      description: get('DESCRIPTION').replace(/\\n/g, ' ').replace(/\\,/g, ','),
      uid: get('UID'),
    })
  }

  return events
}

/** Parse ICS DTSTART value → ISO 8601 string or null */
function parseIcsDate(dtstart: string): string | null {
  if (!dtstart) return null

  // DATE-only: 20260315
  if (/^\d{8}$/.test(dtstart)) {
    return `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}T00:00:00Z`
  }

  // DATETIME: 20260315T235900Z or 20260315T235900
  const match = dtstart.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/)
  if (match) {
    const [, y, mo, d, h, mi, s, z] = match
    return `${y}-${mo}-${d}T${h}:${mi}:${s}${z || ''}`
  }

  return null
}

/** Canvas SUMMARY format: "Assignment Title [Course Name]" */
function parseCourseFromSummary(summary: string): { title: string; course: string } {
  const match = summary.match(/^(.+?)\s*\[(.+)\]$/)
  if (match) return { title: match[1].trim(), course: match[2].trim() }
  return { title: summary, course: 'Unknown Course' }
}

// ── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, feedUrl } = (req.body ?? {}) as { userId?: string; feedUrl?: string }

  if (!userId || !feedUrl) {
    return res.status(400).json({ error: 'userId and feedUrl are required' })
  }

  if (!feedUrl.includes('/feeds/calendars/')) {
    return res.status(400).json({
      error: 'Invalid calendar feed URL. It should contain /feeds/calendars/ — make sure you copied it from the bCourses calendar page.',
    })
  }

  const supabase = createServerSupabaseClient()

  // Save the feed URL so we can refresh it later
  await supabase
    .from('profiles')
    .update({ canvas_feed_url: feedUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)

  // Fetch the ICS file server-side (client can't due to CORS)
  let icsText: string
  try {
    const icsRes = await fetch(feedUrl, {
      headers: { 'User-Agent': 'CalDaily/1.0 (+https://canvas2calendar.vercel.app)' },
    })
    if (!icsRes.ok) throw new Error(`HTTP ${icsRes.status}`)
    icsText = await icsRes.text()
  } catch (err) {
    console.error('ICS fetch failed:', err)
    return res.status(502).json({
      error: 'Could not fetch your calendar feed. Double-check the URL and try again.',
    })
  }

  const events = parseIcs(icsText)
  if (events.length === 0) {
    return res.status(200).json({ ok: true, synced: 0, message: 'No assignment events found in feed' })
  }

  // Wipe existing assignments so re-sync is clean
  await supabase.from('assignments').delete().eq('user_id', userId)

  let synced = 0

  for (const event of events) {
    const { title, course } = parseCourseFromSummary(event.summary)
    const dueAt = parseIcsDate(event.dtstart)
    const urlMatch = event.url.match(/\/assignments\/(\d+)/)
    const canvasId = urlMatch ? urlMatch[1] : event.uid

    synced += await insertEnrichedAssignment(supabase, userId, {
      canvasId: String(canvasId),
      title,
      course,
      courseCode: course,
      dueAt,
      description: event.description || null,
      canvasUrl: event.url,
    })
  }

  return res.status(200).json({ ok: true, synced, total: events.length })
}
