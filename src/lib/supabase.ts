/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ''

// Ensure the URL always has https:// — Vercel env vars are sometimes saved
// without the protocol, causing the SDK to produce malformed OAuth URLs like
// "myproject.supabase.cohttps://mysite.vercel.app/auth/callback"
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://' + supabaseUrl
}

// Ensure trailing slash — required by the Supabase JS SDK when constructing
// auth endpoint paths. Without it the URL segments get concatenated directly.
if (supabaseUrl && !supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl + '/'
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Canvas2Calendar] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and fill in your Supabase URL and anon key.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co/',
  supabaseAnonKey || 'placeholder'
)
