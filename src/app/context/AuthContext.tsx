import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { getProfile, upsertProfile } from '../../lib/database'
import type { Profile } from '../../lib/types'

// Google provider_token expires ~60 minutes after issue.
// We treat tokens older than 50 minutes as expired to give a safety buffer.
const GCAL_TOKEN_TTL_MS = 50 * 60 * 1000

function isStoredTokenValid(savedAt: string | null): boolean {
  if (!savedAt) return false
  return Date.now() - new Date(savedAt).getTime() < GCAL_TOKEN_TTL_MS
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  providerToken: string | null       // valid Google access token, or null
  gcalTokenExpired: boolean          // true when stored token is too old → prompt re-auth
  profile: Profile | null
  profileLoading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  connectGoogleCalendar: () => Promise<{ error: string | null }>  // optional — requests calendar.events scope from Settings
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  providerToken: null,
  gcalTokenExpired: false,
  profile: null,
  profileLoading: true,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  connectGoogleCalendar: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = useCallback(async (userId: string, meta?: { full_name?: string; email?: string; avatar_url?: string }) => {
    setProfileLoading(true)
    // Upsert ensures the row exists (handles first login race conditions)
    if (meta) await upsertProfile(userId, meta)
    const p = await getProfile(userId)
    setProfile(p)
    setProfileLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        loadProfile(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        const { user } = session
        loadProfile(user.id, {
          email: user.email ?? undefined,
          full_name: user.user_metadata?.full_name ?? undefined,
          avatar_url: user.user_metadata?.avatar_url ?? undefined,
        })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    const p = await getProfile(session.user.id)
    setProfile(p)
  }, [session])

  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUpWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    return { error: error?.message ?? null }
  }

  // Opt-in Google Calendar connection — only called from Settings.
  // Only call this from Settings when the user explicitly wants to connect Google Calendar.
  const connectGoogleCalendar = async (): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        skipBrowserRedirect: true,
      },
    })
    if (error) return { error: error.message }
    if (data?.url) {
      window.location.href = data.url
      return { error: null }
    }
    return { error: 'Could not initiate Google Calendar connection. Check Supabase Google provider config.' }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  // Derive the best available Google access token:
  // 1. Fresh from the current session (only present right after OAuth callback)
  // 2. Persisted in the profile row (survives page reloads, valid for ~50 min)
  const sessionToken = session?.provider_token ?? null
  const storedToken  = profile?.google_access_token ?? null
  const storedSavedAt = profile?.google_token_saved_at ?? null

  const providerToken = sessionToken
    ?? (isStoredTokenValid(storedSavedAt) ? storedToken : null)

  // gcalTokenExpired is true when we have a stored token but it's too old,
  // and there's no fresh session token — user needs to re-auth.
  const gcalTokenExpired = !sessionToken && !!storedToken && !isStoredTokenValid(storedSavedAt)

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      session,
      loading,
      providerToken,
      gcalTokenExpired,
      profile,
      profileLoading,
      signInWithEmail,
      signUpWithEmail,
      connectGoogleCalendar,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
