import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Calendar, Loader2 } from 'lucide-react'

/**
 * Lives at /auth/callback.
 *
 * With detectSessionInUrl: true (SDK default), createClient() auto-exchanges
 * the PKCE code from the URL. getSession() internally waits for that exchange
 * to finish (via initializePromise) before returning — so calling it here
 * is safe and will have the session ready.
 */
export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/calendar', { replace: true })
      } else {
        navigate('/auth', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-14 bg-neutral-900 rounded-2xl flex items-center justify-center">
          <Calendar className="size-7 text-white" />
        </div>
        <Loader2 className="size-5 text-neutral-400 animate-spin" />
        <p className="text-sm text-neutral-500">Completing sign-in…</p>
      </div>
    </div>
  )
}
