// POST /api/qstash
// QStash job receiver — executes the Canvas sync pipeline for a user.
// QStash calls this endpoint; Upstash-Signature is verified before processing.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Receiver } from '@upstash/qstash'
import { createServerSupabaseClient } from '../src/lib/supabase-server.js'
import { createCanvasClient } from '../src/lib/canvas/client.js'
import { insertEnrichedAssignment } from '../src/lib/canvas/pipeline.js'
import type { SyncJobPayload } from '../src/lib/qstash/client.js'

// Disable Vercel's body parser so we can read the raw body for signature verification
export const config = { api: { bodyParser: false } }

function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => (data += chunk.toString()))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)

  // Verify QStash signature
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })
  try {
    await receiver.verify({
      signature: req.headers['upstash-signature'] as string,
      body: rawBody,
    })
  } catch {
    return res.status(401).json({ error: 'Invalid QStash signature' })
  }

  const payload = JSON.parse(rawBody) as SyncJobPayload

  try {
    await handleSyncJob(payload)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Sync job failed:', err)
    // Return 500 so QStash retries
    return res.status(500).json({ error: 'Sync failed' })
  }
}

async function handleSyncJob({ userId, courseIds }: SyncJobPayload) {
  const supabase = createServerSupabaseClient()

  // 1. Get user's Canvas API token from their profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('canvas_api_token')
    .eq('id', userId)
    .single()

  if (profileError || !profile?.canvas_api_token) {
    throw new Error(`No Canvas token found for user ${userId}`)
  }

  // 2. Build Canvas client using the user's own token
  const canvas = createCanvasClient({ accessToken: profile.canvas_api_token })

  // 3. Fetch courses (filter by courseIds if provided)
  const allCourses = await canvas.getCourses()
  const courses = courseIds?.length
    ? allCourses.filter((c) => courseIds.includes(c.id))
    : allCourses

  // 4. Delete stale assignments for affected courses so re-sync is clean
  const courseNames = courses.map((c) => c.name)
  if (courseNames.length > 0) {
    await supabase
      .from('assignments')
      .delete()
      .eq('user_id', userId)
      .in('course', courseNames)
  }

  // 5. Fetch assignments per course, enrich with AI, insert to DB
  for (const course of courses) {
    const assignments = await canvas.getAssignments(course.id)
    for (const assignment of assignments) {
      await insertEnrichedAssignment(supabase, userId, {
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
}
