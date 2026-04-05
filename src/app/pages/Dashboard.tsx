import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CheckSquare, Square, BookOpen, CalendarDays, RefreshCw } from "lucide-react";
import { SidebarLayout } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getTasks, toggleTaskCompletion } from "../../lib/database";
import type { Task } from "../../lib/types";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

// Weekly momentum data — computed from real task completions when available,
// otherwise shows a motivational sample curve.
const SAMPLE_MOMENTUM = [
  { day: "Mon", pct: 5 },
  { day: "Tue", pct: 20 },
  { day: "Wed", pct: 40 },
  { day: "Thu", pct: 50 },
  { day: "Fri", pct: 60 },
  { day: "Sat", pct: 80 },
  { day: "Sun", pct: 92 },
];

function buildWeeklyMomentum(tasks: Task[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  // Find Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return days.map((day, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Tasks due on or before this day
    const dueSoFar = tasks.filter(t => {
      const due = t.suggested_date?.split("T")[0];
      return due && due <= dateStr;
    });
    const completedSoFar = dueSoFar.filter(t => t.completed);
    const pct = dueSoFar.length > 0
      ? Math.round((completedSoFar.length / dueSoFar.length) * 100)
      : 0;
    return { day, pct };
  });
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Dashboard — CalBuddy"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getTasks(user.id).then(t => { setTasks(t); setLoading(false); });
  }, [user]);

  const focusTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const momentumData = tasks.length > 0 ? buildWeeklyMomentum(tasks) : SAMPLE_MOMENTUM;
  const highFocusDays = momentumData.filter(d => d.pct >= 60).length;

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

        <h1 className="text-lg font-bold text-white tracking-wide">CalBuddy Dashboard</h1>

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
            {/* Card header bar */}
            <div className="px-5 py-3 text-center" style={{ backgroundColor: BERKELEY_BLUE }}>
              <h2 className="text-sm font-bold text-white tracking-[0.15em]">TODAY'S FOCUS</h2>
            </div>

            {/* Task list */}
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

            {/* Daily goal progress */}
            {totalTasks > 0 && (
              <div className="px-5 pb-5">
                <p className="text-[11px] font-bold text-neutral-700 mb-1.5 tracking-wider">
                  DAILY GOAL: {completionPct}% COMPLETE
                </p>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: CAL_GOLD }}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Weekly Momentum ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-5">
            <h2 className="text-[17px] font-bold mb-4" style={{ color: BERKELEY_BLUE }}>
              WEEKLY MOMENTUM
            </h2>

            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={momentumData} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CAL_GOLD} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={CAL_GOLD} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Completion"]}
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 13 }}
                  cursor={{ stroke: CAL_GOLD, strokeWidth: 1, strokeDasharray: "4 2" }}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke={CAL_GOLD}
                  strokeWidth={3}
                  fill="url(#goldGrad)"
                  dot={{ fill: CAL_GOLD, strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, fill: CAL_GOLD, strokeWidth: 2, stroke: "white" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <p className="text-center text-[14px] font-medium text-neutral-700 mt-3">
              On Track: {highFocusDays} of 7 Days with High Focus
            </p>
          </div>
        </motion.div>

        {/* ── Quick links ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/courses")}
              className="bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow"
            >
              <BookOpen className="size-6 mb-2" style={{ color: CAL_GOLD }} />
              <p className="font-semibold text-sm" style={{ color: BERKELEY_BLUE }}>Courses</p>
              <p className="text-xs text-neutral-400 mt-0.5">Track progress</p>
            </button>
            <button
              onClick={() => navigate("/calendar")}
              className="bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow"
            >
              <CalendarDays className="size-6 mb-2" style={{ color: CAL_GOLD }} />
              <p className="font-semibold text-sm" style={{ color: BERKELEY_BLUE }}>Calendar</p>
              <p className="text-xs text-neutral-400 mt-0.5">Schedule tasks</p>
            </button>
          </div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
}
