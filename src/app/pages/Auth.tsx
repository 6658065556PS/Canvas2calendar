import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

export function Auth() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string })?.from ?? '/dashboard'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState(false)

  useEffect(() => { document.title = 'Sign in — CalDaily' }, [])

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true })
  }, [user, loading, from, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setSubmitting(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email.trim(), password)
      if (error) setError(error)
    } else {
      const { error } = await signUpWithEmail(email.trim(), password)
      if (error) {
        setError(error)
      } else {
        setSignupDone(true)
      }
    }
    setSubmitting(false)
  }

  return (
    <main className="min-h-dvh bg-[#F5F5F5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Logo size={40} />
          </div>
          <h1 className="text-xl font-semibold text-[#003262] tracking-tight">CalDaily</h1>
          <p className="text-xs text-neutral-500 mt-1">Your Berkeley academic co-pilot</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm px-7 py-8">

          {signupDone ? (
            <div className="text-center py-2">
              <div className="text-2xl mb-3">📬</div>
              <h2 className="text-base font-semibold text-neutral-900 mb-2">Check your email</h2>
              <p className="text-sm text-neutral-500">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
              </p>
              <button
                onClick={() => { setSignupDone(false); setMode('signin'); }}
                className="mt-5 text-sm text-[#003262] font-medium hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-neutral-900 mb-5">
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Berkeley email (@berkeley.edu)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#003262] focus:border-transparent"
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#003262] focus:border-transparent"
                />

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full bg-[#003262] text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-[#002347] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                    : mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <p className="text-xs text-neutral-500 text-center mt-4">
                {mode === 'signin' ? (
                  <>No account?{' '}
                    <button onClick={() => { setMode('signup'); setError(null); }} className="text-[#003262] font-medium hover:underline">
                      Create one
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => { setMode('signin'); setError(null); }} className="text-[#003262] font-medium hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>

              <p className="text-[11px] text-neutral-400 text-center mt-4">
                To connect Google Calendar, go to Settings after signing in.
              </p>
            </>
          )}
        </div>

        {/* Footer badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <div className="w-4 h-4 rounded-full bg-[#003262] flex items-center justify-center flex-shrink-0">
            <span className="text-[7px] font-bold text-[#FDB515] leading-none">B</span>
          </div>
          <span className="text-[11px] text-neutral-400">
            Built at <span className="text-neutral-500 font-medium">UC Berkeley SCET</span>
          </span>
        </div>

      </div>
    </main>
  )
}
