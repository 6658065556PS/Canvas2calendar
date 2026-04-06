import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

export function Auth() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string })?.from ?? '/dashboard'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState(false)

  useEffect(() => { document.title = 'Sign in — CalBuddy' }, [])

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
          <div className="w-10 h-10 rounded-lg bg-[#003262] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FDB515]" stroke="currentColor" strokeWidth={2.2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#003262] tracking-tight">CalBuddy</h1>
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

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-neutral-400">or</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Google — secondary, labeled as Calendar */}
              <button
                type="button"
                onClick={async () => {
                  setError(null)
                  const { error } = await signInWithGoogle()
                  if (error) setError(error)
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-neutral-300 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <p className="text-[11px] text-neutral-400 text-center mt-2">
                Google is optional — only needed for Calendar sync
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
