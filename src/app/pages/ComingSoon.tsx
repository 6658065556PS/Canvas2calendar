import { useNavigate } from 'react-router'

export function ComingSoon() {
  const navigate = useNavigate()

  return (
    <main className="min-h-dvh bg-[#F5F5F5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        <div className="w-12 h-12 rounded-xl bg-[#003262] flex items-center justify-center mx-auto mb-6">
          <span className="text-[10px] font-bold text-[#FDB515]">B</span>
        </div>

        <h1 className="text-xl font-semibold text-[#003262] mb-2">Faculty features coming soon</h1>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          We're building course management and student progress views for faculty.
          We'll notify you when it's ready.
        </p>

        <button
          onClick={() => navigate('/auth')}
          className="text-sm text-[#003262] hover:underline font-medium"
        >
          Back to sign in
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-12">
          <div className="w-4 h-4 rounded-full bg-[#003262] flex items-center justify-center">
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
