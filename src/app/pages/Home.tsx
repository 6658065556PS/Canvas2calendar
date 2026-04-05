import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

const CAMPANILE_IMAGE = "https://images.unsplash.com/photo-1583720464836-0f5ff417c4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQyUyMEJlcmtlbGV5JTIwQ2FtcGFuaWxlJTIwdG93ZXJ8ZW58MXx8fHwxNzc1MzYyNDAwfDA&ixlib=rb-4.1.0&q=80&w=1080";
const BEAR_IMAGE = "https://images.unsplash.com/photo-1742855966306-c35f1953cb8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDYWxpZm9ybmlhJTIwZ29sZGVuJTIwYmVhciUyMG1hc2NvdHxlbnwxfHx8fDE3NzUzNjI0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F9F9]" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#003262] rounded-md flex items-center justify-center">
              <span className="text-white text-lg font-bold">C</span>
            </div>
            <span className="text-lg" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: '#1A1C1C' }}>
              CalBuddy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-[#717182]">University Edition</span>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-[#FFB618] hover:bg-[#7D5700] text-[#001D3D] rounded-lg px-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Berkeley Log in
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section — Desktop */}
      <section className="hidden md:block relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[500px]">
            <div className="absolute inset-0">
              <img
                src={CAMPANILE_IMAGE}
                alt="UC Berkeley Campanile"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col justify-end px-12 pb-12">
              <div className="bg-white rounded-lg p-6 max-w-xl mb-8 shadow-lg">
                <p className="text-2xl italic mb-4" style={{ fontFamily: 'var(--font-serif)', color: '#1A1C1C' }}>
                  "Fiat Lux – Let there be light in your schedule."
                </p>
                <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D', lineHeight: 1.1 }}>
                  The Intelligent Path to Academic Excellence.
                </h1>
                <p className="text-lg text-[#717182] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                  Empowering UC Berkeley students with AI-driven clarity and accountability.
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-[#FFB618] hover:bg-[#7D5700] text-[#001D3D] rounded-lg px-8 py-6 text-lg"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <div className="mt-6 text-sm text-[#717182]">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-[#003262] font-semibold hover:underline"
                  >
                    Log In
                  </button>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-8 text-sm text-[#717182]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  <span>SECURE DATA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section — Mobile */}
      <section className="md:hidden bg-white py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs text-[#717182] bg-[#F3F3F3] px-3 py-1 rounded-full">Mobile iOS</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D', lineHeight: 1.2 }}>
              Study Smarter, The Cal Way
            </h1>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-[#003262] hover:bg-[#001D3D] text-white rounded-full px-8 py-6 text-lg mb-4"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Sync Canvas
            </Button>
          </div>

          <div className="relative mb-8">
            <img
              src={BEAR_IMAGE}
              alt="Cal Bear Mascot"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="md:hidden mb-12 text-center">
            <h2 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
              Study smart the SCET way.
            </h2>
            <p className="text-[#717182] text-base" style={{ fontFamily: 'var(--font-sans)' }}>
              Automation that respects your control.
            </p>
          </div>

          <div className="hidden md:block mb-16 text-center">
            <h2 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
              Study smart the SCET way.
            </h2>
            <p className="text-xl text-[#717182]" style={{ fontFamily: 'var(--font-sans)' }}>
              Automation that respects your control.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border-4 border-[#FFB618]">
              <div className="w-20 h-20 bg-[#FFB618] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#001D3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
                AI Breakdown
              </h3>
              <p className="text-[#1A1C1C]" style={{ fontFamily: 'var(--font-sans)' }}>
                Understand complex topics with personalized, AI-powered study aids and summaries.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-4 border-[#FFB618]">
              <div className="w-20 h-20 bg-[#FFB618] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#001D3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
                Smart Scheduling
              </h3>
              <p className="text-[#1A1C1C]" style={{ fontFamily: 'var(--font-sans)' }}>
                Organize your semester with optimized study plans and deadline reminders.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-4 border-[#FFB618]">
              <div className="w-20 h-20 bg-[#FFB618] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#001D3D]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
                SCET Events
              </h3>
              <p className="text-[#1A1C1C]" style={{ fontFamily: 'var(--font-sans)' }}>
                Stay connected with SCET programming, workshops, and exclusive innovation events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F3F3F3] py-8 px-6">
        <div className="max-w-6xl mx-auto" />
      </footer>
    </div>
  );
}
