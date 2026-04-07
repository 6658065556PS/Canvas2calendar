// POST /api/canvas/connect
// Saves the Canvas API token and immediately runs a sync — no QStash involved.
// Called directly from the Sync page when the user connects for the first time.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createServerSupabaseClient } from '../../src/lib/supabase-server.js'
import { createCanvasClient } from '../../src/lib/canvas/client.js'
import { insertEnrichedAssignment } from '../../src/lib/canvas/pipeline.js'

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
  let courses
  try {
    const canvas = createCanvasClient({ accessToken: canvasToken })
    courses = await canvas.getCourses()

    if (!courses.length) {
      return res.status(200).json({ ok: true, synced: 0, message: 'No active courses found' })
    }

    // 3. Delete stale assignments for affected courses
    await supabase
      .from('assignments')
      .delete()
      .eq('user_id', userId)
      .in('course', courses.map((c) => c.name))

    // 4. Fetch + enrich + insert
    let synced = 0
    for (const course of courses) {
      let assignments
      try {
        assignments = await canvas.getAssignments(course.id)
      } catch {
        continue
      }

      for (const assignment of assignments) {
        synced += await insertEnrichedAssignment(supabase, userId, {
          canvasId: String(assignment.id),
          title: assignment.name,
          course: course.name,
          courseCode: course.course_code,
          dueAt: assignment.due_at ?? null,
          description: assignment.description ?? null,
          canvasUrl: assignment.html_url,
        })
      }
    }

    return res.status(200).json({ ok: true, synced })
  } catch (err) {
    return res.status(400).json({ error: 'Invalid Canvas token or could not reach bCourses' })
  }
}
