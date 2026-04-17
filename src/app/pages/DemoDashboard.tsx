import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckSquare, CalendarDays, Calendar as CalIcon, RefreshCw, ArrowRight, Award } from "lucide-react";
import { SidebarLayout } from "../components/Sidebar";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

const FINALS_DATE = new Date("2026-05-08T00:00:00");

function daysUntilFinals(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((FINALS_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

const MOCK_TASKS = [
  { id: "1", name: "Week 7–8 Stay Current reading", source_assignment: "ENGIN 183D — Stay Current 7-8", completed: false },
  { id: "2", name: "Draft resilience framework reflection", source_assignment: "ENGIN 183 — Applied Resilience", completed: false },
  { id: "3", name: "Submit BMoE team formation form", source_assignment: "ENGIN 183B — BMoE Bootcamp", completed: true },
];

// PM and Resilience first, then supporting courses
const MOCK_COURSES = [
  { code: "ENGIN 183D", title: "Product Management", totalTasks: 9, completedTasks: 3 },
  { code: "ENGIN 183", title: "Applied Resilience", totalTasks: 7, completedTasks: 4 },
  { code: "ENGIN 183B", title: "Berkeley Method of Entrepreneurship Bootcamp", totalTasks: 5, completedTasks: 5 },
  { code: "ENGIN 183A", title: "A. Richard Newton Series", totalTasks: 4, completedTasks: 2 },
];

// Semester-wide totals derived from courses
const SEMESTER_TOTAL = MOCK_COURSES.reduce((sum, c) => sum + c.totalTasks, 0);
const SEMESTER_COMPLETED = MOCK_COURSES.reduce((sum, c) => sum + c.completedTasks, 0);
const SEMESTER_PCT = Math.round((SEMESTER_COMPLETED / SEMESTER_TOTAL) * 100);

// SCET Certificate requirements
// Berkeley Certificate in Entrepreneurship & Technology: 183A + 183B + one Challenge Lab + two Special Topics
const CERT_REQUIREMENTS = [
  { label: "Newton Series", code: "ENGIN 183A", units: 1, done: false },
  { label: "BMoE Bootcamp", code: "ENGIN 183B", units: 2, done: true },
  { label: "Challenge Lab", code: "ENGIN 183C", units: 4, done: false },
  { label: "Special Topic I — Product Management", code: "ENGIN 183D", units: 3, done: false },
  { label: "Special Topic II — Applied Resilience", code: "ENGIN 183", units: 3, done: false },
];
const CERT_UNITS_EARNED = CERT_REQUIREMENTS.filter(r => r.done).reduce((s, r) => s + r.units, 0);
const CERT_UNITS_TOTAL = CERT_REQUIREMENTS.reduce((s, r) => s + r.units, 0);
const CERT_PCT = Math.round((CERT_UNITS_EARNED / CERT_UNITS_TOTAL) * 100);

const MOCK_FOCUS_PCT = Math.round(
  (MOCK_TASKS.filter(t => t.completed).length / MOCK_TASKS.length) * 100
);

export function DemoDashboard() {
  const navigate = useNavigate();

  useEffect(() => { document.title = "Dashboard — CalDaily Demo"; }, []);

  const days = daysUntilFinals();

  return (
    <SidebarLayout>
      {/* ── Demo banner ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-4 py-2.5 flex items-center justify-between text-sm"
        style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
      >
        <span className="font-semibold">Demo preview — this is what your dashboard looks like after syncing Canvas</span>
        <button
          onClick={() => navigate("/landing")}
          className="flex items-center gap-1.5 font-bold hover:opacity-80 transition-opacity"
        >
          Sync Canvas now <ArrowRight className="size-4" />
        </button>
      </div>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <header
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: BERKELEY_BLUE }}
      >
        <div className="size-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide">CalDaily Dashboard</h1>
        <div
          className="size-9 rounded-full flex items-center justify-center font-black text-[11px]"
          style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
        >
          CB
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* ── Today's Focus ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 text-center" style={{ backgroundColor: BERKELEY_BLUE }}>
              <h2 className="text-sm font-bold text-white tracking-[0.15em]">TODAY'S FOCUS</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {MOCK_TASKS.map((task, i) => (
                <div
                  key={task.id}
                  className="w-full flex items-center gap-3.5 text-left rounded-xl px-2 py-1.5 -mx-2"
                >
                  <div
                    className="shrink-0 size-8 rounded-md border-2 flex items-center justify-center"
                    style={{
                      borderColor: BERKELEY_BLUE,
                      backgroundColor: task.completed ? BERKELEY_BLUE : "transparent",
                    }}
                  >
                    {task.completed && <CheckSquare className="size-4 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-[15px] leading-snug ${task.completed ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                      {i + 1}. {task.name}
                    </p>
                    {task.source_assignment && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{task.source_assignment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <p className="text-[11px] font-bold text-neutral-700 mb-1.5 tracking-wider">
                DAILY GOAL: {MOCK_FOCUS_PCT}% COMPLETE
              </p>
              <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: CAL_GOLD }}
                  initial={{ width: 0 }}
                  animate={{ width: `${MOCK_FOCUS_PCT}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Semester Completion + Finals ────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-neutral-500">SEMESTER PROGRESS</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: BERKELEY_BLUE }}>
                  {SEMESTER_PCT}%
                  <span className="text-sm font-semibold text-neutral-400 ml-2">
                    {SEMESTER_COMPLETED}/{SEMESTER_TOTAL} tasks
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: BERKELEY_BLUE }}>
                <CalIcon className="size-5" style={{ color: CAL_GOLD }} />
                <span>{days}d until finals</span>
              </div>
            </div>
            <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: CAL_GOLD }}
                initial={{ width: 0 }}
                animate={{ width: `${SEMESTER_PCT}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
              />
            </div>
            <p className="text-xs text-neutral-400">Cumulative across all SCET courses this semester</p>
          </div>
        </motion.div>

        {/* ── My Courses ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-bold mb-4" style={{ color: BERKELEY_BLUE }}>My Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_COURSES.map((course, idx) => {
                const pct = Math.round((course.completedTasks / course.totalTasks) * 100);
                return (
                  <div
                    key={course.code}
                    className="rounded-xl px-4 py-4 flex flex-col gap-2"
                    style={{ backgroundColor: "#F0F2F5" }}
                  >
                    {/* Pin badge for top 2 */}
                    {idx < 2 && (
                      <span
                        className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5"
                        style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
                      >
                        {idx === 0 ? "PM" : "RESILIENCE"}
                      </span>
                    )}
                    <h3 className="text-sm font-bold leading-snug min-h-[2.5rem]" style={{ color: "#1A1C1C" }}>
                      {course.code}: {course.title}
                    </h3>
                    <div className="h-2.5 bg-white rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: CAL_GOLD }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + idx * 0.05 }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500">{pct}% complete · {course.completedTasks}/{course.totalTasks} tasks</p>
                    <button
                      onClick={() => navigate("/landing")}
                      className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: BERKELEY_BLUE }}
                    >
                      View Tasks
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── SCET Certificate Tracker ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="size-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: BERKELEY_BLUE }}
              >
                <Award className="size-4" style={{ color: CAL_GOLD }} />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight" style={{ color: BERKELEY_BLUE }}>
                  SCET Certificate
                </h2>
                <p className="text-[11px] text-neutral-400">Certificate in Entrepreneurship &amp; Technology</p>
              </div>
              <span
                className="ml-auto text-lg font-black"
                style={{ color: BERKELEY_BLUE }}
              >
                {CERT_PCT}%
              </span>
            </div>

            {/* Overall cert progress bar */}
            <div className="h-3 bg-neutral-200 rounded-full overflow-hidden mb-1.5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: BERKELEY_BLUE }}
                initial={{ width: 0 }}
                animate={{ width: `${CERT_PCT}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              {CERT_UNITS_EARNED} of {CERT_UNITS_TOTAL} units complete
            </p>

            {/* Per-requirement rows */}
            <div className="space-y-2">
              {CERT_REQUIREMENTS.map((req) => (
                <div key={req.code} className="flex items-center gap-3">
                  <div
                    className="shrink-0 size-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: req.done ? BERKELEY_BLUE : "#D1D5DB",
                      backgroundColor: req.done ? BERKELEY_BLUE : "transparent",
                    }}
                  >
                    {req.done && (
                      <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${req.done ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                      {req.label}
                    </p>
                    <p className="text-[11px] text-neutral-400">{req.code} · {req.units} {req.units === 1 ? "unit" : "units"}</p>
                  </div>
                  {!req.done && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#F0F2F5", color: BERKELEY_BLUE }}
                    >
                      IN PROGRESS
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Sync CTA ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <button
            onClick={() => navigate("/landing")}
            className="w-full rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow flex items-center gap-4"
            style={{ backgroundColor: BERKELEY_BLUE }}
          >
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: CAL_GOLD }}
            >
              <RefreshCw className="size-5" style={{ color: BERKELEY_BLUE }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">Sync Your Canvas Assignments</p>
              <p className="text-xs text-white/60 mt-0.5">Connect your bCourses account to populate your real tasks</p>
            </div>
            <ArrowRight className="size-5 text-white/60 shrink-0" />
          </button>
        </motion.div>

        {/* ── Calendar quick link ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => navigate("/calendar")}
            className="w-full bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: BERKELEY_BLUE }}
            >
              <CalendarDays className="size-5" style={{ color: CAL_GOLD }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: BERKELEY_BLUE }}>Calendar</p>
              <p className="text-xs text-neutral-400 mt-0.5">Schedule your tasks and manage deadlines</p>
            </div>
          </button>
        </motion.div>

      </div>
    </SidebarLayout>
  );
}
