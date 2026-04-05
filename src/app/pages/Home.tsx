import { useNavigate } from "react-router";
import { ArrowRight, Star, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "../components/ui/button";

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
              onClick={() => navigate("/landing")}
              className="bg-[#FFB618] hover:bg-[#7D5700] text-[#001D3D] rounded-lg px-6"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section — Desktop */}
      <section className="hidden md:block relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[500px]">
            {/* Campanile placeholder — Berkeley Blue gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#003262] via-[#005699] to-[#001D3D]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-60" />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col justify-end px-12 pb-12">
              {/* Berkeley Standard Badge */}
              <div className="bg-white rounded-lg p-6 max-w-xl mb-8 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-[#7D5700]" fill="#7D5700" />
                  <span className="text-sm font-semibold text-[#7D5700] tracking-wide" style={{ fontFamily: 'var(--font-sans)' }}>
                    BERKELEY STANDARD
                  </span>
                </div>
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
                  onClick={() => navigate("/landing")}
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

              {/* Trust Badges */}
              <div className="flex items-center gap-8 text-sm text-[#717182]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  <span>SECURE DATA</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>ASUC APPROVED</span>
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
              onClick={() => navigate("/landing")}
              className="bg-[#003262] hover:bg-[#001D3D] text-white rounded-full px-8 py-6 text-lg mb-4"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Sync Canvas
            </Button>
          </div>

          {/* Cal Bear placeholder */}
          <div className="relative mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-[#FFB618] to-[#7D5700] rounded-full flex items-center justify-center">
              <span className="text-8xl font-black text-[#001D3D]" style={{ fontFamily: 'var(--font-serif)' }}>Cal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Mobile heading */}
          <div className="md:hidden mb-12 text-center">
            <h2 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
              Study smart the SCET way.
            </h2>
            <p className="text-[#717182] text-base" style={{ fontFamily: 'var(--font-sans)' }}>
              Automation that respects your control.
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden md:block mb-16 text-center">
            <h2 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#001D3D' }}>
              Study smart the SCET way.
            </h2>
            <p className="text-xl text-[#717182]" style={{ fontFamily: 'var(--font-sans)' }}>
              Automation that respects your control.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Feature 1: AI Breakdown */}
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

            {/* Feature 2: Smart Scheduling */}
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

            {/* Feature 3: SCET Events */}
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

          {/* Social Proof */}
          <div className="text-center mb-8">
            <p className="text-[#1A1C1C] text-lg mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
              Join thousands of Cal students using CalBuddy!
            </p>
            <Button
              onClick={() => navigate("/landing")}
              className="bg-[#F3F3F3] hover:bg-[#EFEFEF] text-[#1A1C1C] rounded-lg px-8 py-6 text-lg"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F3F3F3] py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-sm text-[#1A1C1C]" style={{ fontFamily: 'var(--font-sans)' }}>
              <button className="hover:text-[#003262]">Features</button>
              <button className="hover:text-[#003262]">Pricing</button>
              <button onClick={() => navigate("/auth")} className="hover:text-[#003262]">Login</button>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-[#F3F3F3] hover:bg-[#003262] hover:text-white flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#F3F3F3] hover:bg-[#003262] hover:text-white flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#F3F3F3] hover:bg-[#003262] hover:text-white flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
