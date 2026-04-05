import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { getProfile, updateProfile } from '../../lib/database'
import { Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const access_token = hash.get('access_token')
    const refresh_token = hash.get('refresh_token')

    if (!access_token || !refresh_token) {
      navigate('/auth', { replace: true })
      return
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(async ({ data }) => {
      const userId = data.session?.user?.id
      if (!userId) {
        navigate('/auth', { replace: true })
        return
      }

      // Persist the Google provider_token so it survives page reloads.
      // Supabase only exposes it on this session object — subsequent getSession()
      // calls return it as null.
      if (data.session?.provider_token) {
        await updateProfile(userId, {
          google_access_token: data.session.provider_token,
          google_token_saved_at: new Date().toISOString(),
        })
      }

      // If we were mid-flow (e.g. connecting Google Calendar during setup),
      // honour the stored destination instead of the default routing.
      const pendingNext = sessionStorage.getItem('calbuddy_next')
      if (pendingNext) {
        sessionStorage.removeItem('calbuddy_next')
        navigate(pendingNext, { replace: true })
        return
      }

      // Check if this user has completed onboarding
      const profile = await getProfile(userId)
      if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    })
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
