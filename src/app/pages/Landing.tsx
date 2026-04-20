import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, X, Sparkles, CheckCircle2, Clock,
  ChevronDown, ChevronRight, Zap, BookOpen, AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AppNav } from "../components/AppNav";
import { Logo } from "../components/Logo";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseColor: string;
  points?: string;
  isUpcoming: boolean;
  urgency?: "overdue" | "today" | "week" | "later";
}

const COURSES = [
  { id: "challenge-lab",   name: "Challenge Lab",      code: "ENGIN 183C-003",    color: BERKELEY_BLUE, shortName: "183C" },
  { id: "product-mgmt",   name: "Product Management", code: "ENGIN 183D-SEM-001", color: "#1E6B4F",     shortName: "183D" },
];

const PM_COLOR = "#1E6B4F";

const ALL_ASSIGNMENTS: Assignment[] = [
  // Challenge Lab — upcoming
  { id: "cl-1", title: "Product Launch Story",                          dueDate: "Due Apr 19 at 11:59pm", points: "5 pts",  courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: true,  urgency: "today" },
  { id: "cl-2", title: "Extra Credit: SCET Nomination",                 dueDate: "Due Apr 25 at 11:59pm", points: "EC",     courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: true,  urgency: "week" },
  { id: "cl-3", title: "Final Pitch Presentation + Tech Review",        dueDate: "Due Apr 28 at 11:59pm", points: "30 pts", courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: true,  urgency: "week" },
  // Product Management — upcoming
  { id: "pm-1", title: "Stay Current 12 - 13",                          dueDate: "Due Apr 19 at 11:59pm", points: "0 pts",  courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: true,  urgency: "today" },
  // Challenge Lab — past
  { id: "cl-4", title: "Value Proposition — Individual Submission",     dueDate: "Closed Apr 13",         points: "1/2",    courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: false },
  { id: "cl-5", title: "Value Proposition — Group Submission",          dueDate: "Apr 12",                points: "2/2",    courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: false },
  { id: "cl-6", title: "Reflection on IIRs",                           dueDate: "Apr 3",                 points: "2/1",    courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: false },
  { id: "cl-7", title: "Midterm Presentation — Customer Research Plan", dueDate: "Closed Mar 18",         points: "28.5/30",courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: false },
  { id: "cl-8", title: "Business Model Canvas",                         dueDate: "Mar 15",                points: "2/2",    courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: false },
  { id: "cl-9", title: "Customer Research Plan and Persona",            dueDate: "Closed Mar 8",          points: "2/2",    courseId: "challenge-lab", courseName: "Challenge Lab",      courseCode: "183C", courseColor: BERKELEY_BLUE, isUpcoming: false },
  // Product Management — past
  { id: "pm-2", title: "Week 11 - 12",                                  dueDate: "Apr 13 at 11:59pm",     points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-3", title: "Stay Current 10 - 11",                          dueDate: "Apr 5 at 11:59pm",      points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-4", title: "Stay Current 9 - 10",                           dueDate: "Mar 29 at 11:59pm",     points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-5", title: "Stay Current 8 - 9",                            dueDate: "Mar 15 at 11:59pm",     points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-6", title: "Stay Current 7 - 8",                            dueDate: "Mar 8 at 11:59pm",      points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-7", title: "Stay Current 6 - 7",                            dueDate: "Mar 1 at 11:59pm",      points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-8", title: "Stay Current 5 - 6",                            dueDate: "Feb 22 at 11:59pm",     points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-9", title: "Academic Integrity Assignment (Spring 2026)",   dueDate: "Feb 20 at 10:59pm",     points: "1/1",    courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-10", title: "Week 4 - 5",                                   dueDate: "Feb 16 at 5:00pm",      points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
  { id: "pm-11", title: "Stay Current Week 3 - 4",                      dueDate: "Feb 9 at 11:59pm",      points: "0",      courseId: "product-mgmt",  courseName: "Product Management", courseCode: "183D", courseColor: PM_COLOR,      isUpcoming: false },
];

const URGENCY_CONFIG = {
  today:   { label: "Due Today",      bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626", dot: "#EF4444" },
  week:    { label: "Due This Week",  bg: "#FFFBEB", border: "#FCD34D", text: "#B45309", dot: CAL_GOLD  },
  later:   { label: "Coming Up",      bg: "#EFF6FF", border: "#93C5FD", text: "#1D4ED8", dot: "#3B82F6" },
  overdue: { label: "Overdue",        bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626", dot: "#EF4444" },
};

function CourseBadge({ code, color }: { code: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold tracking-wide text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {code}
    </span>
  );
}

function TaskCard({ assignment, onDecompose }: { assignment: Assignment; onDecompose: (a: Assignment) => void }) {
  const urgCfg = assignment.urgency ? URGENCY_CONFIG[assignment.urgency] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onDecompose(assignment)}
      className="bg-white rounded-xl border border-neutral-200 px-6 py-5 flex items-center gap-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group"
    >
      {/* Left accent bar */}
      <div className="w-1.5 h-14 rounded-full shrink-0" style={{ backgroundColor: assignment.courseColor }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <CourseBadge code={assignment.courseCode} color={assignment.courseColor} />
          {urgCfg && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: urgCfg.bg, color: urgCfg.text, border: `1px solid ${urgCfg.border}` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: urgCfg.dot }} />
              {urgCfg.label}
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-neutral-900 truncate group-hover:text-[#003262] transition-colors">{assignment.title}</p>
        <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
          <Clock className="size-4 shrink-0" />
          {assignment.dueDate}
          {assignment.points && (
            <span className="ml-1 text-neutral-400">· {assignment.points}</span>
          )}
        </p>
      </div>

      {/* Hint arrow */}
      <Sparkles className="size-5 shrink-0 text-neutral-300 group-hover:text-[#003262] transition-colors" />
    </motion.div>
  );
}

function PastTaskRow({ assignment }: { assignment: Assignment }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-neutral-100 last:border-0">
      <CheckCircle2 className="size-5 text-green-500 shrink-0" />
      <CourseBadge code={assignment.courseCode} color={assignment.courseColor} />
      <span className="flex-1 text-sm font-medium text-neutral-600 truncate">{assignment.title}</span>
      <span className="text-sm text-neutral-400 shrink-0">{assignment.dueDate}</span>
      {assignment.points && (
        <span className="text-sm font-semibold text-neutral-500 shrink-0 min-w-[48px] text-right">{assignment.points}</span>
      )}
    </div>
  );
}

export function Landing() {
  const navigate = useNavigate();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDecomposeModal, setShowDecomposeModal] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [pastExpanded, setPastExpanded] = useState(false);

  useEffect(() => { document.title = "CalDaily — My Courses"; }, []);

  const handleDecompose = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDecomposeModal(true);
  };

  const filtered = ALL_ASSIGNMENTS.filter(a => {
    const matchCourse = filterCourse === "all" || a.courseId === filterCourse || (filterCourse === "special-topics" && a.courseId === "product-mgmt");
    const matchQuery = !query || a.title.toLowerCase().includes(query.toLowerCase());
    return matchCourse && matchQuery;
  });

  const upcoming = filtered.filter(a => a.isUpcoming);
  const past = filtered.filter(a => !a.isUpcoming);

  const todayCount = ALL_ASSIGNMENTS.filter(a => a.isUpcoming && a.urgency === "today").length;
  const weekCount  = ALL_ASSIGNMENTS.filter(a => a.isUpcoming && (a.urgency === "today" || a.urgency === "week")).length;

  // Weekly workload strip — count upcoming tasks per weekday (Mon-Sun)
  const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7; // 0=Mon
  const weekDates = WEEK_DAYS.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - mondayOffset + i);
    return d;
  });
  // Assign upcoming tasks to days based on urgency (today → today's date, week → spread across remaining days)
  const workloadPerDay = weekDates.map((d, i) => {
    const iso = d.toISOString().split("T")[0];
    const todayIso = today.toISOString().split("T")[0];
    let count = 0;
    if (iso === todayIso) count += ALL_ASSIGNMENTS.filter(a => a.isUpcoming && a.urgency === "today").length;
    if (i >= mondayOffset && i < 5) count += ALL_ASSIGNMENTS.filter(a => a.isUpcoming && a.urgency === "week").length / Math.max(1, 5 - mondayOffset);
    return Math.round(count);
  });
  const maxLoad = Math.max(1, ...workloadPerDay);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F0F2F5" }}>
      <AppNav backTo="/" />

      {/* ── Page header ───────────────────────────────────────────── */}
      <div style={{ backgroundColor: BERKELEY_BLUE }} className="px-8 pt-8 pb-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-4">
              <Logo size={48} />
              <div>
                <h1 className="text-white text-3xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                  My Courses
                </h1>
                <p className="text-white/60 text-base mt-0.5">Spring 2026 · 2 courses synced</p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex gap-3 mb-1">
              {todayCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white">
                  <AlertTriangle className="size-4" />
                  {todayCount} due today
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}>
                <Zap className="size-4" />
                {weekCount} due this week
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white">
                <BookOpen className="size-4" />
                {COURSES.length} courses
              </div>
            </div>
          </div>

          {/* Weekly workload strip */}
          <div className="mb-5 bg-white/10 rounded-xl px-4 py-3">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">This week's workload</p>
            <div className="flex gap-1.5 items-end h-10">
              {WEEK_DAYS.map((day, i) => {
                const load = workloadPerDay[i];
                const isToday = i === mondayOffset;
                const barH = load > 0 ? Math.max(20, Math.round((load / maxLoad) * 40)) : 6;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: barH,
                        backgroundColor: isToday ? CAL_GOLD : load > 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                      }}
                    />
                    <span className={`text-[10px] font-semibold ${isToday ? "text-[#FDB515]" : "text-white/50"}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course filter tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterCourse("all")}
              className="px-6 py-3 text-base font-medium rounded-t-lg transition-colors"
              style={{
                backgroundColor: filterCourse === "all" ? "#F0F2F5" : "transparent",
                color: filterCourse === "all" ? BERKELEY_BLUE : "rgba(255,255,255,0.7)",
              }}
            >
              All Courses
            </button>
            {COURSES.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterCourse(c.id)}
                className="px-6 py-3 text-base font-medium rounded-t-lg transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: filterCourse === c.id ? "#F0F2F5" : "transparent",
                  color: filterCourse === c.id ? BERKELEY_BLUE : "rgba(255,255,255,0.7)",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: filterCourse === c.id ? c.color : "rgba(255,255,255,0.5)" }} />
                {c.name}
                <span className="text-[10px] opacity-60">{c.shortName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              type="text"
              placeholder="Search assignments across all courses…"
              className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Upcoming tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
                <Zap className="size-5" style={{ color: CAL_GOLD }} />
                Upcoming Assignments
                <span className="ml-1 text-sm font-normal text-neutral-500">({upcoming.length})</span>
              </h2>
              <p className="text-sm text-neutral-400">Click any task to plan it with AI</p>
            </div>

            {upcoming.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center text-neutral-400 text-sm">
                No upcoming assignments
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(a => (
                  <TaskCard key={a.id} assignment={a} onDecompose={handleDecompose} />
                ))}
              </div>
            )}
          </section>

          {/* Past / completed */}
          <section>
            <button
              onClick={() => setPastExpanded(v => !v)}
              className="flex items-center gap-2 text-xl font-semibold text-neutral-800 mb-4 hover:text-neutral-600 transition-colors"
            >
              {pastExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              <CheckCircle2 className="size-5 text-green-500" />
              Completed Assignments
              <span className="text-sm font-normal text-neutral-500">({past.length})</span>
            </button>

            <AnimatePresence>
              {pastExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
                    {past.map(a => <PastTaskRow key={a.id} assignment={a} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* ── Decompose Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showDecomposeModal && selectedAssignment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDecomposeModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
                {/* Modal header */}
                <div className="p-6 relative" style={{ backgroundColor: BERKELEY_BLUE }}>
                  <button
                    onClick={() => setShowDecomposeModal(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded text-white"
                  >
                    <X className="size-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="size-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>CalDaily AI</h2>
                      <p className="text-sm text-white/70">Smart Task Breakdown</p>
                    </div>
                  </div>
                </div>

                {/* Modal body */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CourseBadge code={selectedAssignment.courseCode} color={selectedAssignment.courseColor} />
                      <span className="text-xs text-neutral-500">{selectedAssignment.courseName}</span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{selectedAssignment.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {selectedAssignment.dueDate}
                    </p>
                  </div>

                  <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: `${BERKELEY_BLUE}08`, border: `1px solid ${BERKELEY_BLUE}20` }}>
                    <p className="text-sm" style={{ color: BERKELEY_BLUE }}>
                      <strong>✨ What happens next:</strong> CalDaily will break this into bite-sized, execution-ready
                      tasks with time estimates and schedule them across your week automatically.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate("/decomposition")}
                      size="lg"
                      className="w-full h-12 text-base font-semibold"
                      style={{ backgroundColor: BERKELEY_BLUE, color: "white" }}
                    >
                      <Sparkles className="size-5 mr-2" />
                      Decompose into Tasks
                    </Button>
                    <Button
                      onClick={() => setShowDecomposeModal(false)}
                      size="lg"
                      variant="outline"
                      className="w-full border-neutral-300 h-12"
                    >
                      Cancel
                    </Button>
                  </div>

                  <p className="text-xs text-neutral-400 text-center mt-4">
                    You'll review and approve all tasks before they're added to your calendar.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
