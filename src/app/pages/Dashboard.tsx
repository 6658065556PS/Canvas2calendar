import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckSquare, CalendarDays, RefreshCw, Calendar as CalIcon, Award, ArrowRight } from "lucide-react";
import { SidebarLayout } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getTasks, toggleTaskCompletion, getAssignments } from "../../lib/database";
import type { Task, Assignment } from "../../lib/types";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

const FINALS_DATE = new Date("2026-05-08T00:00:00");

function daysUntilFinals(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((FINALS_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

interface CourseRow {
  name: string;
  code: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
}

function parseCourse(course: string): { code: string; title: string } {
  const idx = course.indexOf(": ");
  if (idx !== -1) return { code: course.slice(0, idx), title: course.slice(idx + 2) };
  const spaceIdx = course.lastIndexOf(" ");
  if (spaceIdx !== -1 && spaceIdx < 12) return { code: course.slice(0, spaceIdx), title: course.slice(spaceIdx + 1) };
  return { code: "", title: course };
}

// PM and Resilience course codes — pin them first
const PINNED_CODES = ["ENGIN 183D", "ENGIN 183"];

function buildCourseRows(assignments: Assignment[], tasks: Task[]): CourseRow[] {
  const courseMap = new Map<string, Assignment[]>();
  for (const a of assignments) {
    const c = a.course ?? "Other";
    if (!courseMap.has(c)) courseMap.set(c, []);
    courseMap.get(c)!.push(a);
  }

  const rows = Array.from(courseMap.entries()).map(([name, asgns]) => {
    const titles = new Set(asgns.map(a => a.title));
    const courseTasks = tasks.filter(t => t.source_assignment && titles.has(t.source_assignment));
    const { code, title } = parseCourse(name);
    return { name, code, title, totalTasks: courseTasks.length, completedTasks: courseTasks.filter(t => t.completed).length };
  });

  // Pinned courses first
  return [
    ...rows.filter(r => PINNED_CODES.includes(r.code)),
    ...rows.filter(r => !PINNED_CODES.includes(r.code)),
  ];
}

const CERT_REQUIREMENTS = [
  { label: "Newton Series", code: "ENGIN 183A", units: 1, done: false },
  { label: "BMoE Bootcamp", code: "ENGIN 183B", units: 2, done: false },
  { label: "Challenge Lab", code: "ENGIN 183C", units: 4, done: false },
  { label: "Special Topic I — Product Management", code: "ENGIN 183D", units: 3, done: false },
  { label: "Special Topic II — Applied Resilience", code: "ENGIN 183", units: 3, done: false },
];
const CERT_UNITS_TOTAL = CERT_REQUIREMENTS.reduce((s, r) => s + r.units, 0);

export function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Dashboard — CalDaily"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getTasks(user.id), getAssignments(user.id)]).then(([t, a]) => {
      setTasks(t);
      setAssignments(a);
      setLoading(false);
    });
  }, [user]);

  const focusTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const focusPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const courseRows = buildCourseRows(assignments, tasks);

  // Semester-wide totals
  const semesterTotal = courseRows.reduce((s, c) => s + c.totalTasks, 0);
  const semesterCompleted = courseRows.reduce((s, c) => s + c.completedTasks, 0);
  const semesterPct = semesterTotal > 0 ? Math.round((semesterCompleted / semesterTotal) * 100) : 0;

  // Certificate — mark a requirement done if the user has a matching synced course with all tasks complete
  const certReqs = CERT_REQUIREMENTS.map(req => {
    const row = courseRows.find(r => r.code === req.code);
    const done = row ? row.totalTasks > 0 && row.completedTasks === row.totalTasks : false;
    return { ...req, done };
  });
  const certUnitsEarned = certReqs.filter(r => r.done).reduce((s, r) => s + r.units, 0);
  const certPct = Math.round((certUnitsEarned / CERT_UNITS_TOTAL) * 100);

  const days = daysUntilFinals();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const firstName = (profile?.full_name ?? user?.user_metadata?.full_name as string | undefined)
    ?.split(" ")[0] ?? "there";

  async function handleToggle(task: Task) {
    await toggleTaskCompletion(task.id, !task.completed);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  }

  return (
    <SidebarLayout>
      {/* ── Page header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: BERKELEY_BLUE }}
      >
        <button onClick={() => navigate("/settings")} aria-label="Profile">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="size-9 rounded-full border-2 border-white/30 object-cover" />
          ) : (
            <div className="size-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
              {firstName[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </button>

        <h1 className="text-lg font-bold text-white tracking-wide">CalDaily Dashboard</h1>

        <div
          className="size-9 rounded-full flex items-center justify-center font-black text-[11px]"
          style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
        >
          CB
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* ── Today's Focus ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 text-center" style={{ backgroundColor: BERKELEY_BLUE }}>
              <h2 className="text-sm font-bold text-white tracking-[0.15em]">TODAY'S FOCUS</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              {loading ? (
                <p className="py-4 text-center text-neutral-400 text-sm">Loading…</p>
              ) : focusTasks.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  {totalTasks === 0 ? (
                    <>
                      <p className="text-neutral-500 text-sm">No tasks yet.</p>
                      <button
                        onClick={() => navigate("/sync")}
                        className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white"
                        style={{ backgroundColor: BERKELEY_BLUE }}
                      >
                        <RefreshCw className="size-3.5" />
                        Sync Canvas
                      </button>
                    </>
                  ) : (
                    <p className="text-green-600 font-semibold text-sm">All tasks complete! 🎉</p>
                  )}
                </div>
              ) : (
                focusTasks.map((task, i) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggle(task)}
                    className="w-full flex items-center gap-3.5 text-left hover:bg-neutral-50 rounded-xl px-2 py-1.5 -mx-2 transition-colors group"
                  >
                    <div
                      className="shrink-0 size-8 rounded-md border-2 flex items-center justify-center transition-colors"
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
                  </button>
                ))
              )}
            </div>

            {totalTasks > 0 && (
              <div className="px-5 pb-5">
                <p className="text-[11px] font-bold text-neutral-700 mb-1.5 tracking-wider">
                  DAILY GOAL: {focusPct}% COMPLETE
                </p>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: CAL_GOLD }}
                    initial={{ width: 0 }}
                    animate={{ width: `${focusPct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Semester Completion + Finals ────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-neutral-500">SEMESTER PROGRESS</p>
                <p className="text-2xl font-black mt-0.5" style={{ color: BERKELEY_BLUE }}>
                  {loading ? "—" : `${semesterPct}%`}
                  <span className="text-sm font-semibold text-neutral-400 ml-2">
                    {loading ? "" : `${semesterCompleted}/${semesterTotal} tasks`}
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
                animate={{ width: `${semesterPct}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
              />
            </div>
            <p className="text-xs text-neutral-400">Cumulative across all SCET courses this semester</p>
          </div>
        </motion.div>

        {/* ── My Courses ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-bold mb-4" style={{ color: BERKELEY_BLUE }}>My Courses</h2>
            {loading ? (
              <p className="text-sm text-neutral-400 text-center py-4">Loading…</p>
            ) : courseRows.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm text-neutral-500">No courses synced yet.</p>
                <button
                  onClick={() => navigate("/sync")}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: BERKELEY_BLUE }}
                >
                  <RefreshCw className="size-3.5" />
                  Sync Canvas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courseRows.map((course, idx) => {
                  const pct = course.totalTasks > 0
                    ? Math.round((course.completedTasks / course.totalTasks) * 100)
                    : 0;
                  const isPinned = PINNED_CODES.includes(course.code);
                  const pinLabel = course.code === "ENGIN 183D" ? "PM" : course.code === "ENGIN 183" ? "RESILIENCE" : null;
                  return (
                    <div
                      key={course.name}
                      className="rounded-xl px-4 py-4 flex flex-col gap-2"
                      style={{ backgroundColor: "#F0F2F5" }}
                    >
                      {isPinned && pinLabel && (
                        <span
                          className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5"
                          style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
                        >
                          {pinLabel}
                        </span>
                      )}
                      <h3 className="text-sm font-bold leading-snug min-h-[2.5rem]" style={{ color: "#1A1C1C" }}>
                        {course.code ? `${course.code}: ${course.title}` : course.title}
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
                        onClick={() => navigate("/decomposition")}
                        className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: BERKELEY_BLUE }}
                      >
                        View Tasks
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── SCET Certificate Tracker ─────────────────────────────── */}
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
              <span className="ml-auto text-lg font-black" style={{ color: BERKELEY_BLUE }}>
                {loading ? "—" : `${certPct}%`}
              </span>
            </div>

            <div className="h-3 bg-neutral-200 rounded-full overflow-hidden mb-1.5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: BERKELEY_BLUE }}
                initial={{ width: 0 }}
                animate={{ width: `${certPct}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              {certUnitsEarned} of {CERT_UNITS_TOTAL} units complete
            </p>

            <div className="space-y-2">
              {certReqs.map((req) => (
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

        {/* ── Calendar quick link ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
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
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: BERKELEY_BLUE }}>Calendar</p>
              <p className="text-xs text-neutral-400 mt-0.5">Schedule your tasks and manage deadlines</p>
            </div>
            <ArrowRight className="size-5 text-neutral-300 shrink-0" />
          </button>
        </motion.div>
      </div>
    </SidebarLayout>
  );
}
