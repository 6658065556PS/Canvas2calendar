import { supabase } from './supabase'
import type { Assignment, Task, ScheduledTask, Profile } from './types'

// ─── Waitlist ──────────────────────────────────────────────────────────────
export async function addToWaitlist(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('waitlist').insert({ email })
  if (error && error.code === '23505') return { error: null } // already on list – OK
  return { error: error?.message ?? null }
}

// ─── Profile ───────────────────────────────────────────────────────────────

/**
 * Upsert the profile row — call this on every sign-in as a safety net
 * alongside the DB trigger, in case the trigger was not run or failed.
 */
export async function upsertProfile(
  userId: string,
  profile: { email?: string | null; full_name?: string | null; avatar_url?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profile }, { onConflict: 'id' })
  if (error) console.error('[DB] upsertProfile', error)
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as Profile | null
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

// ─── Onboarding ───────────────────────────────────────────────────────────

export interface OnboardingData {
  role: 'student' | 'faculty'
  scet_mode?: 'certificate' | 'single'
  scet_courses?: string[]
}

export async function saveOnboardingProfile(
  userId: string,
  data: OnboardingData,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      role: data.role,
      scet_mode: data.scet_mode ?? null,
      scet_courses: data.scet_courses ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  return { error: error?.message ?? null }
}

// ─── Assignments ──────────────────────────────────────────────────────────
export async function getAssignments(userId: string): Promise<Assignment[]> {
  const { data } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Assignment[]
}

export async function createAssignment(
  userId: string,
  payload: Omit<Assignment, 'id' | 'user_id' | 'created_at'>
): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .insert({ ...payload, user_id: userId })
    .select()
    .single()
  if (error) { console.error('[DB] createAssignment', error); return null }
  return data as Assignment
}

// ─── Tasks ────────────────────────────────────────────────────────────────
export async function getTasks(userId: string): Promise<Task[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
  return (data ?? []) as Task[]
}

/**
 * Bulk-create tasks and return them with their new Supabase IDs.
 */
export async function createTasks(
  userId: string,
  tasks: Array<{
    assignment_id?: string | null
    name: string
    category?: string | null
    estimated_time?: string | null
    suggested_date?: string | null
    difficulty?: string | null
    details?: string | null
    source_assignment?: string | null
    position?: number
  }>
): Promise<Task[]> {
  const rows = tasks.map((t, i) => ({ ...t, user_id: userId, position: t.position ?? i }))
  const { data, error } = await supabase.from('tasks').insert(rows).select()
  if (error) { console.error('[DB] createTasks', error); return [] }
  return (data ?? []) as Task[]
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'name' | 'category' | 'estimated_time' | 'suggested_date' | 'difficulty' | 'details' | 'notes' | 'completed' | 'google_event_id'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId)
  return { error: error?.message ?? null }
}

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
  await supabase.from('tasks').update({ completed, updated_at: new Date().toISOString() }).eq('id', taskId)
}

export async function deleteTask(taskId: string): Promise<void> {
  await supabase.from('tasks').delete().eq('id', taskId)
}

// ─── Scheduled Tasks ──────────────────────────────────────────────────────
/**
 * Load the full weekly schedule (tasks + their time slots) for a given week_start.
 */
export async function getScheduledTasksForWeek(
  userId: string,
  weekStart: string
): Promise<ScheduledTask[]> {
  const { data } = await supabase
    .from('scheduled_tasks')
    .select('*, task:tasks(*)')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .order('time_slot', { ascending: true })
  return (data ?? []) as ScheduledTask[]
}

/**
 * Place a task in a time slot. Uses UPSERT — safe to call on each drag-drop.
 */
export async function upsertScheduledTask(
  userId: string,
  taskId: string,
  day: string,
  timeSlot: string,
  weekStart: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('scheduled_tasks')
    .upsert(
      { user_id: userId, task_id: taskId, day, time_slot: timeSlot, week_start: weekStart },
      { onConflict: 'task_id,week_start' }
    )
  return { error: error?.message ?? null }
}

/**
 * Remove a task from the schedule (drag back to inbox, or delete from slot).
 */
export async function removeScheduledTask(
  userId: string,
  taskId: string,
  weekStart: string
): Promise<void> {
  await supabase
    .from('scheduled_tasks')
    .delete()
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .eq('week_start', weekStart)
}

/**
 * Store the Google Calendar event ID after a successful sync.
 */
export async function saveGoogleEventId(
  scheduledTaskId: string,
  googleEventId: string
): Promise<void> {
  await supabase
    .from('scheduled_tasks')
    .update({ google_event_id: googleEventId })
    .eq('id', scheduledTaskId)
}

// ─── Utilities ────────────────────────────────────────────────────────────
/**
 * Returns the ISO date string (YYYY-MM-DD) of the Sunday that starts
 * the week containing `date` (defaults to today).
 */
export function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay()) // go to Sunday
  return d.toISOString().split('T')[0]
}

/**
 * Given a day name ("Monday") and a time string ("10:00 AM"),
 * returns a full ISO datetime string for the correct date in the given week.
 */
export function buildDateTime(weekStartISO: string, day: string, timeStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOffset = days.indexOf(day)
  if (dayOffset === -1) return new Date().toISOString()

  const weekStart = new Date(weekStartISO + 'T00:00:00')
  weekStart.setDate(weekStart.getDate() + dayOffset)

  // Parse "10:00 AM" / "2:30 PM"
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && hours !== 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0
    weekStart.setHours(hours, minutes, 0, 0)
  }

  return weekStart.toISOString()
}

/** Parse "2 hrs", "30 min", "1.5 hrs" → minutes */
export function parseEstimatedMinutes(estimatedTime: string | null): number {
  if (!estimatedTime) return 30
  const hourMatch = estimatedTime.match(/(\d+\.?\d*)\s*hr/i)
  const minMatch  = estimatedTime.match(/(\d+\.?\d*)\s*min/i)
  let total = 0
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60
  if (minMatch)  total += parseFloat(minMatch[1])
  return total || 30
}
