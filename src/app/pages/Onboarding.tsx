"use client";

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, BookOpen, Award, ChevronRight, Loader2, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { saveOnboardingProfile } from '../../lib/database'
import { fetchScetCatalog } from '../../lib/scet'
import type { ScetCatalog, ScetCourse } from '../../lib/scet'

type Step = 1 | 2 | 3
type Role = 'student' | 'faculty'
type ScetMode = 'certificate' | 'single'

const CATEGORY_LABELS: Record<ScetCourse['category'], string> = {
  core: 'Core (Required)',
  challenge_lab: 'Berkeley Challenge Labs™',
  special_topics: 'Special Topics',
  decal: 'DeCals',
}

const CATEGORY_ORDER: ScetCourse['category'][] = ['core', 'challenge_lab', 'special_topics', 'decal']

export function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [scetMode, setScetMode] = useState<ScetMode | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [catalog, setCatalog] = useState<ScetCatalog | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { document.title = 'Welcome — CalBuddy' }, [])

  // Fetch SCET catalog when we reach step 3
  useEffect(() => {
    if (step !== 3) return
    setCatalogLoading(true)
    setCatalogError(false)
    fetchScetCatalog()
      .then(setCatalog)
      .catch(() => setCatalogError(true))
      .finally(() => setCatalogLoading(false))
  }, [step])

  const finishOnboarding = async (opts: {
    role: Role
    scetMode?: ScetMode
    courses?: string[]
  }) => {
    if (!user) return
    setSaving(true)
    await saveOnboardingProfile(user.id, {
      role: opts.role,
      scet_mode: opts.scetMode,
      scet_courses: opts.courses ?? [],
    })
    await refreshProfile()
    navigate('/sync', { replace: true })
  }

  const handleRoleSelect = (r: Role) => {
    setRole(r)
    if (r === 'faculty') {
      finishOnboarding({ role: 'faculty' }).then(() => navigate('/coming-soon', { replace: true }))
    } else {
      setStep(2)
    }
  }

  const handleModeSelect = (mode: ScetMode) => {
    setScetMode(mode)
    if (mode === 'single') {
      finishOnboarding({ role: 'student', scetMode: 'single' })
    } else {
      setStep(3)
    }
  }

  const toggleCourse = (code: string) => {
    setSelectedCourses(prev => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  const coursesByCategory = catalog
    ? CATEGORY_ORDER.reduce<Record<string, ScetCourse[]>>((acc, cat) => {
        const courses = catalog.courses.filter(c => c.category === cat)
        if (courses.length) acc[cat] = courses
        return acc
      }, {})
    : {}

  return (
    <main className="min-h-dvh bg-[#F5F5F5] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#003262] flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FDB515]" stroke="currentColor" strokeWidth={2.2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs text-neutral-500">Let's set up your CalBuddy</p>
        </div>

        {/* Step indicator */}
        {step > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {([1, 2, 3] as Step[]).map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s < step ? 'w-8 bg-[#003262]' :
                  s === step ? 'w-8 bg-[#003262]' :
                  'w-4 bg-neutral-200'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 1: Role ────────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm px-7 py-8">
                <h2 className="text-base font-semibold text-neutral-900 mb-1">What's your role?</h2>
                <p className="text-sm text-neutral-500 mb-6">This helps us personalize your experience.</p>

                <div className="space-y-3">
                  <RoleCard
                    icon={<GraduationCap className="size-5" />}
                    title="Student"
                    description="Track assignments, manage tasks, earn your SCET certificate"
                    onClick={() => handleRoleSelect('student')}
                  />
                  <RoleCard
                    icon={<BookOpen className="size-5" />}
                    title="Faculty / Staff"
                    description="Course management and student progress tools"
                    badge="Coming soon"
                    onClick={() => handleRoleSelect('faculty')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: SCET track ──────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm px-7 py-8">
                <h2 className="text-base font-semibold text-neutral-900 mb-1">How are you using SCET this semester?</h2>
                <p className="text-sm text-neutral-500 mb-6">This unlocks a certificate completion tracker on your dashboard.</p>

                <div className="space-y-3">
                  <RoleCard
                    icon={<Award className="size-5" />}
                    title="Preparing for the SCET Certificate"
                    description="Track progress toward the Certificate in Entrepreneurship & Technology"
                    onClick={() => handleModeSelect('certificate')}
                  />
                  <RoleCard
                    icon={<BookOpen className="size-5" />}
                    title="Taking a single SCET course"
                    description="Just need assignment tracking and task breakdown for one course"
                    onClick={() => handleModeSelect('single')}
                  />
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Certificate course selection ────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm px-7 py-8">
                <h2 className="text-base font-semibold text-neutral-900 mb-1">Which SCET courses are you in this semester?</h2>
                <p className="text-sm text-neutral-500 mb-1">
                  Select all that apply. These will be tracked toward your certificate.
                </p>

                {catalog && (
                  <p className="text-xs text-[#003262]/70 bg-[#003262]/5 rounded-lg px-3 py-2 mb-5">
                    Showing {catalog.semester} offerings · {catalog.certificateNote}
                  </p>
                )}

                {catalogLoading && (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400">
                    <Loader2 className="size-4 animate-spin" />
                    Loading current SCET offerings…
                  </div>
                )}

                {catalogError && !catalogLoading && (
                  <p className="text-sm text-red-500 mb-4">
                    Couldn't load the live course list — showing common SCET courses instead.
                  </p>
                )}

                {!catalogLoading && Object.entries(coursesByCategory).map(([cat, courses]) => (
                  <div key={cat} className="mb-5">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      {CATEGORY_LABELS[cat as ScetCourse['category']]}
                    </p>
                    <div className="space-y-1.5">
                      {courses.map(course => {
                        const checked = selectedCourses.has(course.code)
                        return (
                          <button
                            key={course.code}
                            type="button"
                            onClick={() => toggleCourse(course.code)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                              checked
                                ? 'border-[#003262] bg-[#003262]/5'
                                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                              checked ? 'bg-[#003262] border-[#003262]' : 'border-neutral-300'
                            }`}>
                              {checked && <Check className="size-2.5 text-white" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-neutral-800">{course.name}</span>
                              <span className="text-xs text-neutral-400 ml-2">{course.code}</span>
                              {course.units && (
                                <span className="text-xs text-neutral-400"> · {course.units} unit{course.units !== 1 ? 's' : ''}</span>
                              )}
                            </div>
                            {course.isCore && (
                              <span className="text-[10px] font-medium text-[#FDB515] bg-[#003262] px-1.5 py-0.5 rounded flex-shrink-0">
                                CORE
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => finishOnboarding({
                      role: 'student',
                      scetMode: 'certificate',
                      courses: Array.from(selectedCourses),
                    })}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#003262] hover:bg-[#002347] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {selectedCourses.size > 0 ? `Continue with ${selectedCourses.size} course${selectedCourses.size !== 1 ? 's' : ''}` : 'Skip for now'}
                        <ChevronRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-neutral-400 text-center mt-3">
                  You can update your courses anytime in Settings.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* SCET badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
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

// ── Sub-component ──────────────────────────────────────────────────────────

function RoleCard({
  icon,
  title,
  description,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-4 border border-neutral-200 rounded-xl px-4 py-4 hover:border-[#003262] hover:bg-[#003262]/[0.02] transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-neutral-100 group-hover:bg-[#003262]/10 flex items-center justify-center text-neutral-500 group-hover:text-[#003262] flex-shrink-0 transition-colors mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-900">{title}</span>
          {badge && (
            <span className="text-[10px] font-medium text-neutral-400 border border-neutral-200 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="size-4 text-neutral-300 group-hover:text-[#003262] flex-shrink-0 mt-1 transition-colors" />
    </button>
  )
}
