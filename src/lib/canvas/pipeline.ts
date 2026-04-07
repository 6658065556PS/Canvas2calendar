// Shared Canvas sync pipeline helper — used by all three sync entry points:
//   api/canvas/connect.ts    (user-triggered via API token)
//   api/canvas/ical-sync.ts  (user-triggered via iCal feed)
//   api/qstash.ts            (daily background job)

import type { SupabaseClient } from '@supabase/supabase-js'
import { enrichAssignment } from '../ai/groq.js'

export interface AssignmentInput {
  canvasId: string
  title: string
  course: string
  courseCode: string
  dueAt: string | null
  description: string | null
  canvasUrl: string
}

/**
 * Enrich one assignment with AI, insert it into the DB, and create a task stub
 * if the AI produced a time estimate. Returns 1 if the assignment was inserted,
 * 0 if it failed.
 */
export async function insertEnrichedAssignment(
  supabase: SupabaseClient,
  userId: string,
  input: AssignmentInput,
): Promise<number> {
  const { canvasId, title, course, courseCode, dueAt, description, canvasUrl } = input

  // AI enrichment — best-effort, never fail the whole sync
  let enrichedTitle = title
  let estimatedTime: string | null = null
  try {
    const enrichment = await enrichAssignment({
      name: title,
      description: description ?? '',
      dueAt: dueAt ?? '',
      courseCode,
    })
    if (enrichment.summary) enrichedTitle = enrichment.summary
    if (enrichment.estimatedMinutes) {
      estimatedTime = enrichment.estimatedMinutes >= 60
        ? `${Math.round(enrichment.estimatedMinutes / 60)} hrs`
        : `${enrichment.estimatedMinutes} min`
    }
  } catch (err) {
    console.warn(`[pipeline] Enrichment skipped for "${title}":`, err)
  }

  const isUpcoming = dueAt ? new Date(dueAt) > new Date() : false

  const { error: insertErr } = await supabase.from('assignments').insert({
    user_id: userId,
    canvas_id: canvasId,
    title: enrichedTitle,
    course,
    due_date: dueAt,
    description: description || null,
    canvas_url: canvasUrl,
    is_upcoming: isUpcoming,
  })

  if (insertErr) {
    console.warn(`[pipeline] Failed to insert "${title}":`, insertErr.message)
    return 0
  }

  // Create task stub if AI produced a time estimate
  if (estimatedTime) {
    const { data: inserted } = await supabase
      .from('assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('canvas_id', canvasId)
      .single()

    if (inserted?.id) {
      await supabase.from('tasks').insert({
        user_id: userId,
        assignment_id: inserted.id,
        name: enrichedTitle,
        category: 'assignment',
        estimated_time: estimatedTime,
        suggested_date: dueAt,
        difficulty: 'medium',
        source_assignment: title,
        completed: false,
        position: 0,
      })
    }
  }

  return 1
}
