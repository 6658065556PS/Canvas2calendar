import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { updateProfile } from '../../lib/database'
import { Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handle() {
      // ── PKCE code exchange (email confirmation links, magic links) ──────────
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error || !data.session) {
          navigate('/auth', { replace: true })
          return
        }
        await routeAfterSession(data.session.user.id)
        return
      }

      // ── Implicit hash flow (Google OAuth) ───────────────────────────────────
      const hash = new URLSearchParams(window.location.hash.slice(1))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')

      if (!access_token || !refresh_token) {
        navigate('/auth', { replace: true })
        return
      }

      const { data } = await supabase.auth.setSession({ access_token, refresh_token })
      const userId = data.session?.user?.id
      if (!userId) {
        navigate('/auth', { replace: true })
        return
      }

      // Persist the Google provider_token so it survives page reloads.
      if (data.session?.provider_token) {
        await updateProfile(userId, {
          google_access_token: data.session.provider_token,
          google_token_saved_at: new Date().toISOString(),
        })
      }

      await routeAfterSession(userId)
    }

    async function routeAfterSession(userId: string) {
      // If we were mid-flow (e.g. connecting Google Calendar during setup),
      // honour the stored destination instead of the default routing.
      const pendingNext = sessionStorage.getItem('calbuddy_next')
      if (pendingNext) {
        sessionStorage.removeItem('calbuddy_next')
        navigate(pendingNext, { replace: true })
        return
      }

      navigate('/dashboard', { replace: true })
    }

    handle()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#003262] flex items-center justify-center">
          <span className="text-[7px] font-bold text-[#FDB515]" aria-hidden>B</span>
        </div>
        <Loader2 className="size-4 text-neutral-400 animate-spin" />
        <p className="text-sm text-neutral-500">Completing sign-in…</p>
      </div>
    </div>
  )
}
