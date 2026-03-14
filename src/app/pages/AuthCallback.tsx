import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Calendar, Loader2 } from 'lucide-react'

/**
 * This page lives at /auth/callback.
 * Supabase redirects the user here after the Google OAuth flow completes.
 * It exchanges the code/fragment for a session, then sends the user to /calendar.
 */
export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // When Supabase redirects back it puts the session info in the URL hash.
    // getSession() processes it automatically.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/calendar', { replace: true })
      } else {
        navigate('/auth', { replace: true })
      }
    })
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
