import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Flame, CalendarDays, ChevronRight, BookOpen } from "lucide-react";
import { SidebarLayout } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getAssignments, getTasks } from "../../lib/database";
import type { Assignment, Task } from "../../lib/types";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

// Berkeley Spring 2026 finals start: May 8
const FINALS_DATE = new Date("2026-05-08T00:00:00");

function daysUntilFinals(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((FINALS_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function computeStreak(tasks: Task[]): number {
  const completedDates = new Set(
    tasks
      .filter(t => t.completed && t.updated_at)
      .map(t => t.updated_at.split("T")[0])
  );
  if (completedDates.size === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (completedDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break; // streak broken
    }
  }
  return streak;
}

interface CourseProgress {
  name: string;
  total: number;
  completed: number;
  pct: number;
}

function buildCourseProgress(assignments: Assignment[], tasks: Task[]): CourseProgress[] {
  const assignmentIdToCompleted = new Map<string, boolean>();
  for (const task of tasks) {
    if (task.assignment_id) {
      const existing = assignmentIdToCompleted.get(task.assignment_id);
      assignmentIdToCompleted.set(task.assignment_id, (existing ?? false) || task.completed);
    }
  }

  const courseMap = new Map<string, { total: number; completed: number }>();
  for (const a of assignments) {
    const courseName = a.course ?? "Unknown";
    if (!courseMap.has(courseName)) courseMap.set(courseName, { total: 0, completed: 0 });
    const entry = courseMap.get(courseName)!;
    entry.total++;
    if (assignmentIdToCompleted.get(a.id)) entry.completed++;
  }

  return Array.from(courseMap.entries())
    .map(([name, { total, completed }]) => ({
      name,
      total,
      completed,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);
}

// Sample data shown before Canvas is connected
const DEMO_COURSES: CourseProgress[] = [
  { name: "CS 61A: Structure & Interpretation of Computer Programs", total: 12, completed: 9, pct: 75 },
  { name: "DATA 8: Foundations of Data Science",                     total: 10, completed: 6, pct: 60 },
  { name: "ECON 1: Introduction to Economics",                       total: 11, completed: 5, pct: 45 },
  { name: "POL SCI 2: Intro to Comparative Politics",                total: 8,  completed: 7, pct: 90 },
];

function GoldProgressBar({ pct, animate: shouldAnimate = true }: { pct: number; animate?: boolean }) {
  return (
    <div className="h-3.5 bg-neutral-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: CAL_GOLD }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function CourseCard({ course }: { course: CourseProgress }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4"
    >
      <h3 className="font-bold text-[15px] text-neutral-900 leading-snug">{course.name}</h3>
      <div className="space-y-1.5">
        <GoldProgressBar pct={course.pct} />
        <p className="text-sm text-neutral-600">
          {course.pct}% Complete
          <span className="text-neutral-400 ml-1.5 text-xs">
            ({course.completed}/{course.total} assignments)
          </span>
        </p>
      </div>
      <button
        onClick={() => navigate("/decomposition")}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
      >
        Deep Dive
      </button>
    </motion.div>
  );
}

export function Coursework() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Courses — CalDaily"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getAssignments(user.id), getTasks(user.id)]).then(([a, t]) => {
      setAssignments(a);
      setTasks(t);
      setLoading(false);
    });
  }, [user]);

  const streak = useMemo(() => computeStreak(tasks), [tasks]);
  const days   = daysUntilFinals();
  const courses = useMemo(() => {
    if (assignments.length === 0) return DEMO_COURSES;
    return buildCourseProgress(assignments, tasks);
  }, [assignments, tasks]);

  const isDemo = assignments.length === 0;

  return (
    <SidebarLayout>
      {/* ── Page header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 px-5 py-4 bg-[#f0f2f5] border-b border-neutral-200">
        <h1 className="text-2xl font-bold" style={{ color: BERKELEY_BLUE }}>
          Coursework Accountability
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── Streak + Finals countdown ───────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
            {/* Study streak */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[15px]"
                style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
              >
                <Flame className="size-4.5" />
                {streak} Day Streak
              </div>
              <p className="text-[11px] font-medium text-neutral-500 leading-tight max-w-[70px]">
                Study<br />Streak
              </p>
            </div>

            {/* Days until finals */}
            <div className="flex items-center gap-2 text-base font-semibold" style={{ color: BERKELEY_BLUE }}>
              <CalendarDays className="size-5" style={{ color: CAL_GOLD }} />
              {days} Days Until Finals
            </div>
          </div>
        </motion.div>

        {/* ── Demo notice ────────────────────────────────────────── */}
        {isDemo && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BookOpen className="size-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">Showing demo data — sync Canvas to see your courses.</p>
              </div>
              <button
                onClick={() => navigate("/sync")}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
              >
                Sync <ChevronRight className="size-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Course grid ─────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((course, i) => (
              <motion.div
                key={course.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Overall summary ─────────────────────────────────────── */}
        {!loading && courses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
              <p className="text-sm font-semibold text-neutral-600 mb-3">Overall Progress</p>
              <div className="space-y-1.5">
                <GoldProgressBar
                  pct={Math.round(courses.reduce((s, c) => s + c.pct, 0) / courses.length)}
                />
                <p className="text-sm text-neutral-500">
                  {Math.round(courses.reduce((s, c) => s + c.pct, 0) / courses.length)}% average across {courses.length} courses
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SidebarLayout>
  );
}
