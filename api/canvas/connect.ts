// POST /api/canvas/connect
// Saves the Canvas API token and immediately runs a sync — no QStash involved.
// Called directly from the Sync page when the user connects for the first time.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServerSupabaseClient } from '../../src/lib/supabase-server.js'
import { createCanvasClient } from '../../src/lib/canvas/client.js'
import { enrichAssignment } from '../../src/lib/ai/groq.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, canvasToken } = (req.body ?? {}) as { userId?: string; canvasToken?: string }
  if (!userId || !canvasToken) {
    return res.status(400).json({ error: 'userId and canvasToken are required' })
  }

  const supabase = createServerSupabaseClient()

  // 1. Save token to profile
  const { error: saveErr } = await supabase
    .from('profiles')
    .update({ canvas_api_token: canvasToken, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (saveErr) return res.status(500).json({ error: 'Failed to save API token' })

  // 2. Build Canvas client
  const canvas = createCanvasClient({ accessToken: canvasToken })

  // 3. Fetch courses
  let courses
  try {
    courses = await canvas.getCourses()
  } catch (err) {
    return res.status(400).json({ error: 'Invalid Canvas token or could not reach bCourses' })
  }

  if (!courses.length) {
    return res.status(200).json({ ok: true, synced: 0, message: 'No active courses found' })
  }

  // 4. Delete stale assignments for this user
  const courseNames = courses.map((c) => c.name)
  await supabase
    .from('assignments')
    .delete()
    .eq('user_id', userId)
    .in('course', courseNames)

  // 5. Fetch + enrich + upsert
  let synced = 0
  for (const course of courses) {
    let assignments
    try {
      assignments = await canvas.getAssignments(course.id)
    } catch {
      continue
    }

    for (const assignment of assignments) {
      let enrichedTitle = assignment.name
      let estimatedTime: string | null = null
      try {
        const enrichment = await enrichAssignment({
          name: assignment.name,
          description: assignment.description ?? '',
          dueAt: assignment.due_at ?? '',
          courseCode: course.course_code,
        })
        if (enrichment.summary) enrichedTitle = enrichment.summary
        if (enrichment.estimatedMinutes) {
          estimatedTime = enrichment.estimatedMinutes >= 60
            ? `${Math.round(enrichment.estimatedMinutes / 60)} hrs`
            : `${enrichment.estimatedMinutes} min`
        }
      } catch {
        // enrichment is best-effort
      }

      const isUpcoming = assignment.due_at ? new Date(assignment.due_at) > new Date() : false

      const { data: inserted, error } = await supabase
        .from('assignments')
        .insert({
          user_id: userId,
          canvas_id: String(assignment.id),
          title: enrichedTitle,
          course: course.name,
          due_date: assignment.due_at ?? null,
          description: assignment.description ?? null,
          canvas_url: assignment.html_url,
          is_upcoming: isUpcoming,
        })
        .select('id')
        .single()

      if (error) {
        console.warn(`Failed to insert assignment ${assignment.id}:`, error.message)
        continue
      }

      synced++

      if (estimatedTime && inserted?.id) {
        await supabase.from('tasks').insert({
          user_id: userId,
          assignment_id: inserted.id,
          name: enrichedTitle,
          category: 'assignment',
          estimated_time: estimatedTime,
          suggested_date: assignment.due_at ?? null,
          difficulty: 'medium',
          source_assignment: assignment.name,
          completed: false,
          position: 0,
        })
      }
    }
  }

  return res.status(200).json({ ok: true, synced })
}
