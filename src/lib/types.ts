// ─── Shared domain types ─────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  canvas_api_token: string | null
  canvas_feed_url: string | null   // bCourses iCal feed URL (alternative to API token)
  google_access_token: string | null      // persisted Google OAuth provider_token
  google_token_saved_at: string | null    // ISO timestamp when token was captured

  // ── Onboarding ─────────────────────────────────────────────────────────
  // DB migration required:
  //   alter table profiles add column canvas_feed_url text;
  //   alter table profiles add column onboarding_completed boolean default false;
  //   alter table profiles add column role text;
  //   alter table profiles add column scet_mode text;
  //   alter table profiles add column scet_courses text[] default '{}';
  onboarding_completed: boolean | null
  role: 'student' | 'faculty' | null
  scet_mode: 'certificate' | 'single' | null
  scet_courses: string[] | null   // selected SCET course codes, e.g. ["ENGIN 183A", "ENGIN 183C"]

  settings: {
    autoSync: boolean
    breakDownAssignments: boolean
    syncAnnouncements: boolean
    timeEstimation: 'conservative' | 'moderate' | 'aggressive'
    workloadPreference: 'balanced' | 'front-loaded' | 'back-loaded'
    weekStartDay: 'sunday' | 'monday'
  }
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  user_id: string
  canvas_id: string | null
  title: string
  course: string | null
  due_date: string | null
  description: string | null
  canvas_url: string | null
  is_upcoming: boolean
  created_at: string
}

export type TaskCategory = 'reading' | 'problemset' | 'discussion' | 'preclass' | 'reflection'
export type TaskDifficulty = 'easy' | 'medium' | 'hard'
export type TaskConfidence = 'high' | 'medium' | 'needs-review'

export interface Task {
  id: string
  user_id: string
  assignment_id: string | null
  name: string
  category: TaskCategory | null
  estimated_time: string | null
  suggested_date: string | null
  difficulty: TaskDifficulty | null
  details: string | null
  notes: string | null
  completed: boolean
  source_assignment: string | null
  google_event_id: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface ScheduledTask {
  id: string
  user_id: string
  task_id: string
  day: string          // e.g. "Monday"
  time_slot: string    // e.g. "10:00 AM"
  week_start: string | null  // ISO date string
  google_event_id: string | null
  created_at: string
  task?: Task          // joined
}

export interface ScheduledTaskWithDetails extends ScheduledTask {
  task: Task
}
