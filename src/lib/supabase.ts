/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

// ─── Sanitize Supabase URL ────────────────────────────────────────────────────
// Vercel env vars are sometimes saved without the protocol prefix or trailing
// slash, which causes the Supabase SDK to produce malformed OAuth URLs like:
//   cnxylelamwuimmkzmhov.supabase.cohttps://mysite.vercel.app/auth/callback
//
// We defensively normalise the URL before passing it to createClient.

let rawUrl = ((import.meta.env.VITE_SUPABASE_URL as string) ?? '').trim()

// 1. Ensure https:// prefix
if (rawUrl && !rawUrl.startsWith('http')) {
  rawUrl = 'https://' + rawUrl
}

// 2. Ensure trailing slash (Supabase SDK requires it for correct path joining)
if (rawUrl && !rawUrl.endsWith('/')) {
  rawUrl = rawUrl + '/'
}

const supabaseUrl     = rawUrl || 'https://placeholder.supabase.co/'
const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '').trim() || 'placeholder'

if (supabaseUrl === 'https://placeholder.supabase.co/' || supabaseAnonKey === 'placeholder') {
  console.warn(
    '[Canvas2Calendar] Missing Supabase env vars. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // detectSessionInUrl is disabled so the SDK does NOT race with
    // AuthCallback's explicit exchangeCodeForSession call. Both trying
    // to exchange the same PKCE code causes "invalid_grant" errors.
    detectSessionInUrl: false,
    storageKey: 'canvas2calendar-auth',
  },
})
