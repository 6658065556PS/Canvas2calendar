import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

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
    // Grab the initial session (e.g. after page refresh)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    // Build an explicit, unambiguous redirect URL.
    // VITE_SITE_URL must be set in Vercel → Settings → Environment Variables
    // to the production domain (e.g. https://canvas2calendar.vercel.app).
    // If it is not set we fall back to localhost for local development.
    const viteUrl = import.meta.env.VITE_SITE_URL as string | undefined
    const base    = viteUrl
      ? viteUrl.replace(/\/$/, '')          // strip any accidental trailing slash
      : 'http://localhost:5173'
    const redirectTo = `${base}/auth/callback`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events',
        redirectTo,
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
    // provider_token is the Google OAuth access token Supabase captures
    providerToken: session?.provider_token ?? null,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
