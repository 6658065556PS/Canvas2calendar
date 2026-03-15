/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

// Normalise the URL: ensure https:// prefix and trailing slash
let rawUrl = ((import.meta.env.VITE_SUPABASE_URL as string) ?? '').trim()
if (rawUrl && !rawUrl.startsWith('http')) rawUrl = 'https://' + rawUrl
if (rawUrl && !rawUrl.endsWith('/'))     rawUrl = rawUrl + '/'

const supabaseUrl     = rawUrl || 'https://placeholder.supabase.co/'
const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '').trim() || 'placeholder'

// Simplest possible client — all auth defaults (detectSessionInUrl: true,
// persistSession: true, autoRefreshToken: true, storageKey: default).
// detectSessionInUrl lets the SDK auto-exchange the PKCE code on /auth/callback,
// and getSession() waits for that exchange to complete before returning.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
