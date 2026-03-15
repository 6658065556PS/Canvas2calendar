import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Calendar, Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const url  = window.location.href
    const hash = window.location.hash      // e.g. #access_token=...&refresh_token=...
    const search = window.location.search  // e.g. ?code=...

    console.log('[AuthCallback] mounted')
    console.log('[AuthCallback] full URL:', url)
    console.log('[AuthCallback] hash:', hash)
    console.log('[AuthCallback] search:', search)

    const hashParams  = new URLSearchParams(hash.slice(1))   // strip leading #
    const queryParams = new URLSearchParams(search)

    const accessToken  = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const code         = queryParams.get('code')

    console.log('[AuthCallback] access_token in hash:', !!accessToken)
    console.log('[AuthCallback] refresh_token in hash:', !!refreshToken)
    console.log('[AuthCallback] code in query:', !!code)

    if (accessToken && refreshToken) {
      // ── Implicit flow ──────────────────────────────────────────────────────
      // Supabase returned tokens directly in the URL hash.
      console.log('[AuthCallback] implicit flow → calling setSession')
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          console.log('[AuthCallback] setSession result — session:', !!data.session, 'error:', error?.message)
          if (data.session) {
            navigate('/calendar', { replace: true })
          } else {
            console.error('[AuthCallback] setSession returned no session:', error)
            navigate('/auth', { replace: true })
          }
        })

    } else if (code) {
      // ── PKCE flow ──────────────────────────────────────────────────────────
      // Supabase returned a one-time code; we must exchange it for a session.
      console.log('[AuthCallback] PKCE flow → calling exchangeCodeForSession')
      supabase.auth.exchangeCodeForSession(url)
        .then(({ data, error }) => {
          console.log('[AuthCallback] exchangeCodeForSession result — session:', !!data.session, 'error:', error?.message)
          if (data.session) {
            navigate('/calendar', { replace: true })
          } else {
            console.error('[AuthCallback] exchange returned no session:', error)
            navigate('/auth', { replace: true })
          }
        })

    } else {
      // ── No tokens ─────────────────────────────────────────────────────────
      // Could be a direct visit or an OAuth error.
      const oauthError = queryParams.get('error_description') ?? queryParams.get('error')
      console.log('[AuthCallback] no tokens found, oauth error:', oauthError)
      supabase.auth.getSession().then(({ data }) => {
        console.log('[AuthCallback] fallback getSession:', !!data.session)
        navigate(data.session ? '/calendar' : '/auth', { replace: true })
      })
    }
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
