import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { upsertProfile } from '../../lib/database'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  /** Google OAuth access token — use for Google Calendar API calls */
  providerToken: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  providerToken: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Restore any existing session from localStorage first
    supabase.auth.getSession().then(({ data }) => {
      console.log('[AuthContext] initial getSession:', data.session ? 'session found' : 'no session')
      setSession(data.session)
      setLoading(false)
    })

    // 2. Then listen for future auth changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('[AuthContext] auth state changed:', _event, '| user:', newSession?.user?.email ?? 'none')
      setSession(newSession)
      setLoading(false)

      // Ensure profile row exists on sign-in (safety net alongside DB trigger)
      if (_event === 'SIGNED_IN' && newSession?.user) {
        const u = newSession.user
        upsertProfile(u.id, {
          email: u.email ?? null,
          full_name: u.user_metadata?.full_name ?? null,
          avatar_url: u.user_metadata?.avatar_url ?? null,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://canvas2calendar.vercel.app/auth/callback',
        scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    providerToken: session?.provider_token ?? null,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
