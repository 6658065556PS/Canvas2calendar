// Server-side Supabase client using the service role key (bypasses RLS).
// Use ONLY in Vercel API routes — never import from frontend code.

import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('SUPABASE_URL is not set')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
