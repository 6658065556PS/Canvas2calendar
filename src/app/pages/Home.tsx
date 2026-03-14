import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { addToWaitlist } from "../../lib/database";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setWaitlistError(null);
    // Save to Supabase waitlist table
    const { error } = await addToWaitlist(email);
    if (error) {
      setWaitlistError("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => navigate("/landing"), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-semibold text-neutral-900">Canvas2Calendar</div>
          {user ? (
            <Button
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm"
              onClick={() => navigate("/calendar")}
            >
              Go to Calendar
              <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-sm text-neutral-600 hover:text-neutral-900"
              onClick={() => navigate("/landing")}
            >
              Skip to App
              <ArrowRight className="size-4 ml-1" />
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl font-semibold text-neutral-900 leading-tight mb-6">
              Canvas2Calendar helps Berkeley SCET students turn coursework into organized weekly tasks — <span className="text-blue-600">automatically.</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              Stop planning manually. Start executing your SCET classes with clarity.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Berkeley email"
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Join the Waitlist
                  </Button>
                </div>
                {waitlistError && (
                  <p className="text-sm text-red-600">{waitlistError}</p>
                )}
                <p className="text-sm text-neutral-500">
                  Free while in beta · No credit card required
                </p>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="size-5 text-white" />
                  </div>
                  <p className="font-semibold text-green-900">You're on the waitlist!</p>
                </div>
                <p className="text-sm text-green-700 ml-11">
                  We'll email you when Canvas2Calendar is ready for SCET students.
                </p>
              </div>
            )}

            {/* Value Props */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="size-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="size-3 text-blue-600" />
                </div>
                <span>Imports from Canvas</span>
              </div>
              <div className="flex items-center gap-1">
                <ChevronRight className="size-4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="size-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="size-3 text-blue-600" />
                </div>
                <span>Syncs to Google Calendar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white border-y border-neutral-200 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-6 text-center">
            Planning coursework from Canvas is messy.
          </h2>
          <p className="text-lg text-neutral-600 mb-8 text-center leading-relaxed">
            Students must constantly:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="size-8 bg-neutral-200 rounded-lg mb-3 flex items-center justify-center text-neutral-600 font-semibold">
                1
              </div>
              <p className="text-neutral-700">Open Canvas assignments</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="size-8 bg-neutral-200 rounded-lg mb-3 flex items-center justify-center text-neutral-600 font-semibold">
                2
              </div>
              <p className="text-neutral-700">Check syllabus documents</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="size-8 bg-neutral-200 rounded-lg mb-3 flex items-center justify-center text-neutral-600 font-semibold">
                3
              </div>
              <p className="text-neutral-700">Search through modules</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="size-8 bg-neutral-200 rounded-lg mb-3 flex items-center justify-center text-neutral-600 font-semibold">
                4
              </div>
              <p className="text-neutral-700">Manually rebuild task lists</p>
            </div>
          </div>
          <p className="text-center text-neutral-500 mt-8 italic">
            This process repeats every semester.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-12 text-center">
            Canvas → Tasks → Weekly Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="size-16 bg-blue-100 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <div className="text-2xl">📥</div>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">1. Import</h3>
              <p className="text-sm text-neutral-600">
                Automatically imports assignments and deadlines from Canvas
              </p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-blue-100 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <div className="text-2xl">✂️</div>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">2. Break Down</h3>
              <p className="text-sm text-neutral-600">
                Breaks large assignments into clear, actionable micro-tasks
              </p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-blue-100 rounded-xl mb-4 flex items-center justify-center mx-auto">
                <div className="text-2xl">📅</div>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">3. Organize</h3>
              <p className="text-sm text-neutral-600">
                Creates a structured weekly plan synced to your calendar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-white border-y border-neutral-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
              <div className="size-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Canvas Sync</h3>
              <p className="text-neutral-600">
                Automatically imports assignments and deadlines. No manual data entry required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
              <div className="size-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Micro-Task Extraction</h3>
              <p className="text-neutral-600">
                Breaks large assignments into clear action steps with time estimates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
              <div className="size-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Weekly Task Dashboard</h3>
              <p className="text-neutral-600">
                See exactly what to work on each week with a clean, organized view.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8">
              <div className="size-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
                <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Google Calendar Sync</h3>
              <p className="text-neutral-600">
                Tasks sync directly to your personal calendar. Plan once, access everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Task View */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-4 text-center">
            From Canvas chaos to structured tasks
          </h2>
          <p className="text-neutral-600 mb-10 text-center">
            See your SCET coursework organized by course with clear task types
          </p>
          <div className="bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4 bg-neutral-50">
              <div className="text-xs text-neutral-500 mb-1">Synced from Canvas</div>
              <h3 className="font-semibold text-neutral-900">SCET Tasks</h3>
            </div>
            <div className="divide-y divide-neutral-200">
              <div className="px-6 py-4 flex items-center gap-4">
                <div className="size-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">ENGIN 183C-003</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">📖 Canvas</span>
                  </div>
                  <div className="text-sm text-neutral-900">Read: Designing Startups to Transform Society</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">⏱️ 1.5 hrs</div>
                  <div className="text-xs text-neutral-600">Tomorrow</div>
                </div>
              </div>
              <div className="px-6 py-4 flex items-center gap-4">
                <div className="size-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">ENGIN 183E</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">📖 Canvas</span>
                  </div>
                  <div className="text-sm text-neutral-900">Technology Entrepreneurship — Case Study Analysis</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">⏱️ 2 hrs</div>
                  <div className="text-xs text-neutral-600">Wed, Feb 25</div>
                </div>
              </div>
              <div className="px-6 py-4 flex items-center gap-4">
                <div className="size-2 bg-orange-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">ENGIN 183D</span>
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">⭐ AI Suggestion</span>
                  </div>
                  <div className="text-sm text-neutral-900">Product Management — Sprint Planning Exercise</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">⏱️ 1 hr</div>
                  <div className="text-xs text-neutral-600">Thu, Feb 26</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-neutral-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Start organizing your SCET coursework automatically.
          </h2>
          <p className="text-neutral-300 mb-8">
            Built for Berkeley SCET students.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Berkeley email"
                  className="flex-1 px-4 py-3 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-neutral-800 text-white placeholder-neutral-400"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Join the Waitlist
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 justify-center mb-2">
                <div className="size-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="size-5 text-white" />
                </div>
                <p className="font-semibold text-green-100">Thanks for joining!</p>
              </div>
              <p className="text-sm text-green-200">
                Redirecting to the app...
              </p>
            </div>
          )}
          <p className="text-sm text-neutral-400 mt-6">
            app.studyblocks.io
          </p>
        </div>
      </section>
    </div>
  );
}