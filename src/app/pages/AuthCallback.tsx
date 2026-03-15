import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Calendar, Loader2 } from 'lucide-react'

/**
 * Lives at /auth/callback.
 * Supabase redirects here after Google OAuth. The SDK detects the code/hash
 * in the URL (detectSessionInUrl: true) and exchanges it for a session.
 * We wait for the SIGNED_IN event rather than calling getSession() eagerly,
 * because the code exchange is async and getSession() can return null before
 * it completes — causing a premature redirect back to /auth.
 */
export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let navigated = false

    const go = (path: string) => {
      if (navigated) return
      navigated = true
      navigate(path, { replace: true })
    }

    // Primary: wait for SDK to fire SIGNED_IN after code exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        go('/calendar')
      } else if (event === 'SIGNED_OUT') {
        go('/auth')
      }
    })

    // Fallback: session already exists (e.g. user revisited callback while logged in)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go('/calendar')
    })

    // Safety net: if nothing resolves in 10 s, send to sign-in
    const timeout = setTimeout(() => go('/auth'), 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="size-14 bg-neutral-900 rounded-2xl flex items-center justify-center">
          <Calendar className="size-7 text-white" />
        </div>
        <Loader2 className="size-5 text-neutral-400 animate-spin" />
        <p className="text-sm text-neutral-500">Completing sign-in…</p>
      </div>
    </div>
  )
}
