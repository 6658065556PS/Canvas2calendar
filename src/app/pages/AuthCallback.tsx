import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Calendar, Loader2, AlertCircle } from 'lucide-react'

/**
 * Lives at /auth/callback.
 *
 * Supabase redirects here after Google OAuth with ?code=xxx (PKCE flow).
 * We explicitly call exchangeCodeForSession so we control the exchange,
 * handle errors visibly, and avoid a race with detectSessionInUrl.
 */
export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = window.location.href
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // PKCE flow: exchange code for session explicitly
      supabase.auth.exchangeCodeForSession(url)
        .then(({ data, error: err }) => {
          if (err) {
            console.error('[AuthCallback] exchangeCodeForSession:', err.message)
            setError(err.message)
            setTimeout(() => navigate('/auth', { replace: true }), 3000)
          } else if (data.session) {
            navigate('/calendar', { replace: true })
          } else {
            navigate('/auth', { replace: true })
          }
        })
    } else {
      // No code — check for an existing session (e.g. user revisited the URL)
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          navigate('/calendar', { replace: true })
        } else {
          // OAuth error params (e.g. user denied access)
          const oauthError = params.get('error_description') ?? params.get('error')
          if (oauthError) setError(oauthError)
          setTimeout(() => navigate('/auth', { replace: true }), 3000)
        }
      })
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
        <div className="size-14 bg-neutral-900 rounded-2xl flex items-center justify-center">
          <Calendar className="size-7 text-white" />
        </div>

        {error ? (
          <>
            <AlertCircle className="size-5 text-red-500" />
            <p className="text-sm text-red-600 font-medium">Sign-in failed</p>
            <p className="text-xs text-neutral-500">{error}</p>
            <p className="text-xs text-neutral-400">Redirecting back to sign-in…</p>
          </>
        ) : (
          <>
            <Loader2 className="size-5 text-neutral-400 animate-spin" />
            <p className="text-sm text-neutral-500">Completing sign-in…</p>
          </>
        )}
      </div>
    </div>
  )
}
