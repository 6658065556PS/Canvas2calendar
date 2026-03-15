/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ''

// Ensure the URL always has a protocol — Vercel env vars are sometimes set
// without "https://" which causes the Supabase client to produce malformed
// OAuth redirect URLs like "myproject.supabase.cohttps://..."
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://' + supabaseUrl
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Canvas2Calendar] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and fill in your Supabase URL and anon key.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)
