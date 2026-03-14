/**
 * Google Calendar REST API helpers.
 *
 * We use the Google OAuth `provider_token` that Supabase captures during
 * sign-in (when the `calendar` scope is requested).  It is a standard
 * Bearer token valid for ~1 hour.  If the user's token has expired they
 * are prompted to re-sign-in.
 */

import { buildDateTime, parseEstimatedMinutes } from './database'
import type { ScheduledTask } from './types'

const GCAL_BASE = 'https://www.googleapis.com/calendar/v3'

// ─── Low-level fetch wrapper ───────────────────────────────────────────────
async function gcalFetch(
  providerToken: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${GCAL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${providerToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
}

// ─── Create a single event ─────────────────────────────────────────────────
export async function createCalendarEvent(
  providerToken: string,
  task: {
    name: string
    course: string | null
    estimated_time: string | null
    details: string | null
    notes: string | null
  },
  day: string,
  timeSlot: string,
  weekStart: string
): Promise<string | null> {
  const startISO = buildDateTime(weekStart, day, timeSlot)
  const durationMinutes = parseEstimatedMinutes(task.estimated_time)
  const endDate = new Date(startISO)
  endDate.setMinutes(endDate.getMinutes() + durationMinutes)

  const body = {
    summary: task.course ? `[${task.course}] ${task.name}` : task.name,
    description: [task.details, task.notes].filter(Boolean).join('\n\n') || undefined,
    start: { dateTime: startISO },
    end:   { dateTime: endDate.toISOString() },
    colorId: '1',
  }

  const res = await gcalFetch(providerToken, '/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[GCal] createEvent error', err)
    return null
  }

  const data = await res.json()
  return data.id as string
}

// ─── Delete a single event ─────────────────────────────────────────────────
export async function deleteCalendarEvent(
  providerToken: string,
  eventId: string
): Promise<boolean> {
  const res = await gcalFetch(providerToken, `/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
  })
  return res.ok || res.status === 404
}

// ─── Sync all scheduled tasks for a week ──────────────────────────────────
export interface SyncResult {
  synced: number
  failed: number
  eventIds: Record<string, string> // scheduledTask.id → Google event ID
}

export async function syncWeekToGoogleCalendar(
  providerToken: string,
  scheduledTasks: ScheduledTask[],
  weekStart: string
): Promise<SyncResult> {
  let synced = 0
  let failed = 0
  const eventIds: Record<string, string> = {}

  for (const st of scheduledTasks) {
    if (!st.task) continue
    const eventId = await createCalendarEvent(
      providerToken,
      {
        name: st.task.name,
        course: st.task.source_assignment,
        estimated_time: st.task.estimated_time,
        details: st.task.details,
        notes: st.task.notes,
      },
      st.day,
      st.time_slot,
      weekStart
    )
    if (eventId) {
      synced++
      eventIds[st.id] = eventId
    } else {
      failed++
    }
  }

  return { synced, failed, eventIds }
}
