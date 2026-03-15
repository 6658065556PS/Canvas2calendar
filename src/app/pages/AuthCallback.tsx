import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../../lib/supabase'
import { Calendar, Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      // 1. Try PKCE flow first (?code= in query string)
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (!error && data.session) {
        navigate('/calendar', { replace: true })
        return
      }

      // 2. Fall back to implicit flow (#access_token= in hash)
      const hash = new URLSearchParams(window.location.hash.slice(1))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')
      if (access_token && refresh_token) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token })
        if (!sessionError && sessionData.session) {
          navigate('/calendar', { replace: true })
          return
        }
      }

      // 3. Nothing worked
      navigate('/auth', { replace: true })
    }

    handleCallback()
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
