import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckSquare, CalendarDays, Flame, Calendar as CalIcon, RefreshCw, ArrowRight } from "lucide-react";
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
  { id: "1", name: "Review Week 7–8 readings", source_assignment: "Stay Current 7-8", completed: false },
  { id: "2", name: "Outline project proposal draft", source_assignment: "Venture Design Sprint", completed: false },
  { id: "3", name: "Complete problem set 4", source_assignment: "INDENG 135 — Problem Set 4", completed: true },
];

const MOCK_COURSES = [
  { name: "ENGIN 183D: Technology Entrepreneurship", code: "ENGIN 183D", title: "Technology Entrepreneurship", totalTasks: 6, completedTasks: 2 },
  { name: "INDENG 135: Decision Making", code: "INDENG 135", title: "Decision Making", totalTasks: 8, completedTasks: 5 },
  { name: "BIO 1B: General Biology", code: "BIO 1B", title: "General Biology", totalTasks: 4, completedTasks: 1 },
  { name: "UGBA 10: Intro to Business", code: "UGBA 10", title: "Intro to Business", totalTasks: 5, completedTasks: 5 },
];

const MOCK_COMPLETION_PCT = Math.round(
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
                DAILY GOAL: {MOCK_COMPLETION_PCT}% COMPLETE
              </p>
              <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: CAL_GOLD }}
                  initial={{ width: 0 }}
                  animate={{ width: `${MOCK_COMPLETION_PCT}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Streak + Finals ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[15px]"
                style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
              >
                <Flame className="size-4" />
                3 Day Streak
              </div>
              <p className="text-[11px] font-medium text-neutral-500 leading-tight max-w-[70px]">
                Study<br />Streak
              </p>
            </div>
            <div className="flex items-center gap-2 text-base font-semibold" style={{ color: BERKELEY_BLUE }}>
              <CalIcon className="size-5" style={{ color: CAL_GOLD }} />
              {days} Days Until Finals
            </div>
          </div>
        </motion.div>

        {/* ── My Courses ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-bold mb-4" style={{ color: BERKELEY_BLUE }}>My Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_COURSES.map((course) => {
                const pct = Math.round((course.completedTasks / course.totalTasks) * 100);
                return (
                  <div
                    key={course.name}
                    className="rounded-xl px-4 py-4 flex flex-col gap-2"
                    style={{ backgroundColor: "#F0F2F5" }}
                  >
                    <h3 className="text-sm font-bold leading-snug min-h-[2.5rem]" style={{ color: "#1A1C1C" }}>
                      {course.code}: {course.title}
                    </h3>
                    <div className="h-2.5 bg-white rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: CAL_GOLD }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
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

        {/* ── Sync CTA ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
