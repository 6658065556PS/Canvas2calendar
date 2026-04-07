import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Info,
  CalendarCheck,
  Loader2,
  List,
  BookOpen,
  FileText,
  MessageSquare,
  Brain,
  Sparkles,
  X,
  CheckCircle2,
  Circle,
  Wand2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { SidebarLayout } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  getScheduledTasksForWeek,
  getTasks,
  getWeekStart,
  getProfile,
  saveGoogleEventId,
  updateTask,
  upsertScheduledTask,
} from "../../lib/database";
import { parseEstimatedMinutes } from "../../lib/database";
import { syncWeekToGoogleCalendar } from "../../lib/googleCalendar";
import type { ScheduledTask, Task as DBTask } from "../../lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalTask {
  id: string;
  name: string;
  course: string;
  estimatedTime: string;
  color: string;
  category: string;
  notes?: string;
  dueDate?: string;
  completed?: boolean;
}

interface PanelState {
  task: CalTask;
  name: string;
  estimatedTime: string;
  dueDate: string;
  category: string;
  notes: string;
  completed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ItemType = "TASK";
const daysOfWeek   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
  "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

const categoryConfig: Record<string, {
  icon: React.ElementType; label: string;
  color: string; bg: string; border: string; cardColor: string;
}> = {
  reading:    { icon: BookOpen,      label: "Reading",    color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",  cardColor: "bg-blue-100 border-blue-300 text-blue-900" },
  problemset: { icon: FileText,      label: "Assignment", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", cardColor: "bg-purple-100 border-purple-300 text-purple-900" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  cardColor: "bg-green-100 border-green-300 text-green-900" },
  preclass:   { icon: Brain,         label: "Pre-Class",  color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", cardColor: "bg-orange-100 border-orange-300 text-orange-900" },
  reflection: { icon: Sparkles,      label: "Reflection", color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-200",   cardColor: "bg-pink-100 border-pink-300 text-pink-900" },
};

const defaultCardColor = "bg-neutral-100 border-neutral-300 text-neutral-900";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toCalTask(t: DBTask): CalTask {
  return {
    id: t.id,
    name: t.name,
    course: t.source_assignment ?? "Canvas",
    estimatedTime: t.estimated_time ?? "30 min",
    color: t.category ? (categoryConfig[t.category]?.cardColor ?? defaultCardColor) : defaultCardColor,
    category: t.category ?? "general",
    notes: t.notes ?? undefined,
    dueDate: t.suggested_date ?? undefined,
    completed: t.completed,
  };
}

function convertToCalendarTask(task: any): CalTask {
  return {
    id: task.id,
    name: task.name,
    course: task.course || task.source_assignment || "Canvas",
    estimatedTime: task.estimatedTime || task.estimated_time || "30 min",
    color: task.category ? (categoryConfig[task.category]?.cardColor ?? defaultCardColor) : defaultCardColor,
    category: task.category || "general",
    notes: task.notes,
    dueDate: task.dueDate || task.suggested_date,
    completed: task.completed ?? false,
  };
}

function dedup<T extends { id: string }>(arr: T[]): T[] {
  return [...new Map(arr.map((x) => [x.id, x])).values()];
}

// ─── Task Side Panel ──────────────────────────────────────────────────────────

function TaskPanel({
  panel,
  onChange,
  onClose,
  onSave,
}: {
  panel: PanelState;
  onChange: (updates: Partial<Omit<PanelState, "task">>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const cfg = categoryConfig[panel.category];

  return (
    <motion.div
      key="task-panel"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white border-l border-neutral-200 shadow-2xl z-40 flex flex-col"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          {cfg ? (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} border ${cfg.border}`}>
              <cfg.icon className={`size-3.5 ${cfg.color}`} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              <span className="text-xs font-medium text-neutral-500">General</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="size-7 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Task name */}
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 block">
            Task Name
          </label>
          <textarea
            value={panel.name}
            onChange={(e) => onChange({ name: e.target.value })}
            onBlur={onSave}
            rows={2}
            className="w-full text-base font-medium text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          />
        </div>

        {/* Row: time + due date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 block">
              Estimated Time
            </label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
              <input
                type="text"
                value={panel.estimatedTime}
                onChange={(e) => onChange({ estimatedTime: e.target.value })}
                onBlur={onSave}
                className="w-full text-sm border border-neutral-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                placeholder="e.g. 45 min"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 block">
              Due Date
            </label>
            <input
              type="text"
              value={panel.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value })}
              onBlur={onSave}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
              placeholder="e.g. Mon, Mar 17"
            />
          </div>
        </div>

        {/* Task type */}
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 block">
            Task Type
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryConfig).map(([key, c]) => {
              const Icon = c.icon;
              const active = panel.category === key;
              return (
                <button
                  key={key}
                  onClick={() => { onChange({ category: key }); setTimeout(onSave, 0); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    active
                      ? `${c.bg} ${c.border} ${c.color}`
                      : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {c.label}
                </button>
              );
            })}
            <button
              onClick={() => { onChange({ category: "general" }); setTimeout(onSave, 0); }}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                !categoryConfig[panel.category]
                  ? "bg-neutral-100 border-neutral-300 text-neutral-900"
                  : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400"
              }`}
            >
              General
            </button>
          </div>
        </div>

        {/* Notes / workspace */}
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5 block">
            Notes &amp; Workspace
          </label>
          <textarea
            value={panel.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            onBlur={onSave}
            rows={10}
            placeholder="Write notes, outlines, drafts, or anything you need for this task…"
            className="w-full text-sm text-neutral-700 border border-neutral-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition leading-relaxed"
          />
        </div>
      </div>

      {/* Footer: Mark Complete */}
      <div className="border-t border-neutral-100 px-5 py-4">
        <button
          onClick={() => { onChange({ completed: !panel.completed }); setTimeout(onSave, 0); }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-medium text-sm transition-all ${
            panel.completed
              ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
          }`}
        >
          {panel.completed ? (
            <><CheckCircle2 className="size-4" /> Completed — click to undo</>
          ) : (
            <><Circle className="size-4 text-neutral-400" /> Mark as Complete</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Inbox card ───────────────────────────────────────────────────────────────

function InboxTaskCard({ task }: { task: CalTask }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { task },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  const cfg = categoryConfig[task.category];

  return (
    <div
      ref={drag}
      className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : task.completed ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="text-neutral-300 hover:text-neutral-500 transition-colors flex-shrink-0">
        <GripVertical className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug mb-1 line-clamp-2 ${task.completed ? "line-through text-neutral-400" : "text-neutral-900"}`}>
          {task.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Clock className="size-3 flex-shrink-0" />
          <span>{task.estimatedTime}</span>
          {task.dueDate && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="truncate">{task.dueDate}</span>
            </>
          )}
        </div>
      </div>
      {cfg ? (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.border} border`}>
          <cfg.icon className={`size-3 ${cfg.color}`} />
          <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 bg-neutral-100 border border-neutral-200">
          <span className="text-[10px] font-medium text-neutral-500">General</span>
        </div>
      )}
    </div>
  );
}

// ─── Calendar cell task chip ──────────────────────────────────────────────────

function DraggableTask({ task, onOpen }: { task: CalTask; onOpen: (t: CalTask) => void }) {
  const dragStart = useRef<number>(0);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { task },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      onMouseDown={() => { dragStart.current = Date.now(); }}
      onClick={() => {
        // Only open panel on short clicks, not drags
        if (Date.now() - dragStart.current < 200) onOpen(task);
      }}
      className={`${task.color} border rounded px-2 py-1.5 text-xs cursor-pointer select-none ${
        isDragging ? "opacity-50" : task.completed ? "opacity-50" : ""
      } hover:shadow-sm transition-shadow`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.name}, ${task.estimatedTime}`}
    >
      <div className="flex items-start gap-1">
        <GripVertical className="size-3 opacity-40 flex-shrink-0 mt-0.5 cursor-move" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className={`line-clamp-2 font-medium ${task.completed ? "line-through opacity-60" : ""}`}>
            {task.name}
          </div>
          <div className="text-[10px] opacity-70 mt-0.5">{task.estimatedTime}</div>
        </div>
        {task.completed && <CheckCircle2 className="size-3 opacity-60 flex-shrink-0 mt-0.5" />}
      </div>
    </div>
  );
}

// ─── Calendar cell ────────────────────────────────────────────────────────────

function CalendarCell({
  day, time, tasks, isToday, onDrop, onOpen,
}: {
  day: string; time: string; tasks: CalTask[];
  isToday?: boolean;
  onDrop: (task: CalTask) => void;
  onOpen: (task: CalTask) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: { task: CalTask }) => onDrop(item.task),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  return (
    <div
      ref={drop}
      className={`border-r border-b border-neutral-200 p-1 min-h-[60px] relative ${
        isToday ? "bg-yellow-50/40" : "bg-white"
      } ${isOver ? "bg-blue-100 ring-2 ring-blue-500 ring-inset" : ""} hover:bg-neutral-50/50 transition-colors`}
      aria-label={`${day} at ${time}`}
      role="region"
    >
      {tasks.map((task) => (
        <DraggableTask key={`${task.id}-${day}-${time}`} task={task} onOpen={onOpen} />
      ))}
    </div>
  );
}

// ─── Main Calendar component ──────────────────────────────────────────────────

export function Calendar() {
  const navigate  = useNavigate();
  const { user, providerToken } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = (() => {
    const base = new Date(getWeekStart() + "T00:00:00");
    base.setDate(base.getDate() + weekOffset * 7);
    return base.toISOString().split("T")[0];
  })();

  const [schedule, setSchedule] = useState<Record<string, Record<string, CalTask[]>>>(() => {
    const s: Record<string, Record<string, CalTask[]>> = {};
    daysOfWeek.forEach((d) => { s[d] = {}; });
    return s;
  });
  const [inboxTasks, setInboxTasks]     = useState<CalTask[]>([]);
  const [scheduledRows, setScheduledRows] = useState<ScheduledTask[]>([]);
  const [showMobileInbox, setShowMobileInbox] = useState(true);
  const [syncing, setSyncing]           = useState(false);
  const [syncMessage, setSyncMessage]   = useState<string | null>(null);
  const [panel, setPanel]               = useState<PanelState | null>(null);
  const [autoScheduling, setAutoScheduling] = useState(false);

  // weekStart is Sunday; Mon = +1, …, Sun = +7 (daysOfWeek index 0–6)
  const weekDates: Date[] = daysOfWeek.map((_, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const todayStr = new Date().toISOString().split("T")[0];

  const currentWeek = (() => {
    const mon = weekDates[0];
    const sun = weekDates[6];
    const fmt = (dt: Date) => dt.toLocaleString("en-US", { month: "short", day: "numeric" });
    return `${fmt(mon)}–${fmt(sun)}, ${sun.getFullYear()}`;
  })();

  useEffect(() => { document.title = "Calendar — CalDaily"; }, []);

  // ── Load tasks ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("workspaceUnscheduled");
      if (saved) setInboxTasks(dedup(JSON.parse(saved).map(convertToCalendarTask)));
      return;
    }

    getTasks(user.id).then((rows) => {
      setInboxTasks(dedup(rows.map(toCalTask)));
    });

    // Reset schedule before loading so stale week data doesn't linger
    setSchedule(() => { const s: Record<string, Record<string, CalTask[]>> = {}; daysOfWeek.forEach((d) => { s[d] = {}; }); return s; });

    getScheduledTasksForWeek(user.id, weekStart).then((rows) => {
      if (rows.length === 0) return; // no tasks for this week — leave schedule empty
      setScheduledRows(rows);
      const cal: Record<string, Record<string, CalTask[]>> = {};
      daysOfWeek.forEach((d) => { cal[d] = {}; });
      rows.forEach((row: any) => {
        if (!row.task) return;
        const shortDay = daysOfWeek[fullDayNames.indexOf(row.day)];
        if (!shortDay) return;
        const slot = timeSlots.find((t) => t === row.time_slot) ?? row.time_slot;
        cal[shortDay][slot] = [...(cal[shortDay][slot] ?? []), convertToCalendarTask(row.task)];
      });
      setSchedule(cal);
    });
  }, [user, weekStart]);

  // ── Panel helpers ───────────────────────────────────────────────────────────
  const openPanel = (task: CalTask) => {
    setPanel({
      task,
      name: task.name,
      estimatedTime: task.estimatedTime,
      dueDate: task.dueDate ?? "",
      category: task.category,
      notes: task.notes ?? "",
      completed: task.completed ?? false,
    });
  };

  const closePanel = () => setPanel(null);

  const handlePanelChange = (updates: Partial<Omit<PanelState, "task">>) => {
    setPanel((p) => p ? { ...p, ...updates } : null);
  };

  const handlePanelSave = async () => {
    if (!panel) return;
    const id = panel.task.id;
    // Persist to Supabase if it's a real UUID
    if (id.includes("-")) {
      await updateTask(id, {
        name: panel.name,
        estimated_time: panel.estimatedTime,
        suggested_date: panel.dueDate || null,
        category: (panel.category !== "general" ? panel.category : null) as any,
        notes: panel.notes || null,
        completed: panel.completed,
      });
    }
    // Reflect edits in the inbox and schedule
    const updatedTask: CalTask = {
      ...panel.task,
      name: panel.name,
      estimatedTime: panel.estimatedTime,
      dueDate: panel.dueDate || undefined,
      category: panel.category,
      notes: panel.notes || undefined,
      completed: panel.completed,
      color: panel.category !== "general"
        ? (categoryConfig[panel.category]?.cardColor ?? defaultCardColor)
        : defaultCardColor,
    };
    setInboxTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    setSchedule((prev) => {
      const next = { ...prev };
      daysOfWeek.forEach((day) => {
        if (!next[day]) return;
        Object.keys(next[day]).forEach((time) => {
          next[day][time] = next[day][time].map((t) => (t.id === id ? updatedTask : t));
        });
      });
      return next;
    });
  };

  // ── Google Calendar sync ────────────────────────────────────────────────────
  const handleGCalSync = async () => {
    if (!providerToken) {
      navigate("/settings");
      return;
    }
    setSyncing(true);
    setSyncMessage(null);
    const { synced, failed, eventIds } = await syncWeekToGoogleCalendar(
      providerToken, scheduledRows, weekStart
    );
    await Promise.all(
      Object.entries(eventIds).map(([stId, evId]) => saveGoogleEventId(stId, evId))
    );
    setSyncing(false);
    setSyncMessage(
      failed === 0
        ? `✓ Synced ${synced} event${synced !== 1 ? "s" : ""} to Google Calendar!`
        : `Synced ${synced}, ${failed} failed.`
    );
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleDrop = (day: string, time: string, task: CalTask) => {
    // Optimistic UI update
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: [...(prev[day]?.[time] ?? []), task],
      },
    }));

    // Persist to Supabase for logged-in users with real UUIDs
    if (user && task.id.includes("-")) {
      const fullDay = fullDayNames[daysOfWeek.indexOf(day)];
      upsertScheduledTask(user.id, task.id, fullDay, time, weekStart).then(({ error }) => {
        if (error) console.error("[Calendar] upsertScheduledTask", error);
      });
    }
  };

  // ── Auto-schedule ───────────────────────────────────────────────────────────
  const handleAutoSchedule = async () => {
    const alreadyScheduledIds = new Set(
      Object.values(schedule).flatMap((d) => Object.values(d).flatMap((tasks) => tasks.map((t) => t.id)))
    );
    const unscheduled = inboxTasks.filter((t) => !alreadyScheduledIds.has(t.id) && !t.completed);
    if (unscheduled.length === 0) return;

    setAutoScheduling(true);

    // Read user settings
    const settings = user ? (await getProfile(user.id))?.settings : null;
    const workload = settings?.workloadPreference ?? 'balanced';
    const timeEst  = settings?.timeEstimation ?? 'moderate';
    const timeMultiplier = timeEst === 'conservative' ? 1.25 : timeEst === 'aggressive' ? 0.85 : 1.0;

    // Max slots per day before moving to next day (respects workload preference)
    const maxSlotsPerDay: Record<string, number[]> = {
      'balanced':     [3, 3, 3, 3, 3, 0, 0],
      'front-loaded': [5, 4, 3, 2, 2, 0, 0],
      'back-loaded':  [2, 2, 3, 4, 5, 0, 0],
    };
    const dailyCaps = maxSlotsPerDay[workload] ?? maxSlotsPerDay['balanced'];

    // Work hours ordered by preference (morning-first)
    const workSlots = [
      "9:00 AM","10:00 AM","11:00 AM","12:00 PM",
      "1:00 PM","2:00 PM","3:00 PM","4:00 PM",
      "5:00 PM","6:00 PM","7:00 PM","8:00 PM",
    ];

    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Parse a due-date string ("2026-04-12" or "Apr 12") → Date or null
    function parseDueDate(s: string | undefined): Date | null {
      if (!s) return null;
      const iso = new Date(s + "T00:00:00");
      if (!isNaN(iso.getTime())) return iso;
      const human = new Date(`${s} ${today.getFullYear()}`);
      if (!isNaN(human.getTime())) return human;
      return null;
    }

    // Sunday of the week containing `date` — matches getWeekStart() convention
    function weekStartOf(date: Date): string {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split("T")[0];
    }

    // Sort tasks: earliest due date first; no due date goes last
    const sorted = [...unscheduled].sort((a, b) => {
      const da = parseDueDate(a.dueDate), db = parseDueDate(b.dueDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });

    // Track occupied slots per (weekStart, shortDay): weekOccupied[wkStart][shortDay] = Set<time>
    const weekOccupied = new Map<string, Record<string, Set<string>>>();

    // Pre-populate current week from the live schedule state
    const initWeek = (wkStart: string) => {
      if (weekOccupied.has(wkStart)) return;
      const entry: Record<string, Set<string>> = {};
      daysOfWeek.forEach((d) => { entry[d] = new Set(); });
      weekOccupied.set(wkStart, entry);
    };
    initWeek(weekStart);
    daysOfWeek.forEach((d) => {
      Object.entries(schedule[d] ?? {}).forEach(([time, tasks]) => {
        if (tasks.length > 0) weekOccupied.get(weekStart)![d].add(time);
      });
    });

    // daysOfWeek index (Mon=0…Sun=6) ↔ JS getDay() (Sun=0, Mon=1…Sat=6)
    // dayIdx = (jsDay + 6) % 7
    const placements: Array<{ task: CalTask; day: string; time: string; wkStart: string }> = [];

    for (const task of sorted) {
      const due = parseDueDate(task.dueDate);
      // Search from today; stop at due date (or 8 weeks out if no due date)
      const deadline = due ?? new Date(today.getTime() + 56 * 24 * 60 * 60 * 1000);
      const estMins  = parseEstimatedMinutes(task.estimatedTime) * timeMultiplier;
      // Prefer scheduling at least estMins/60 days before deadline, minimum 1 day buffer
      const bufferDays = Math.max(1, Math.ceil(estMins / 60));
      const targetBy = new Date(deadline.getTime() - bufferDays * 24 * 60 * 60 * 1000);
      // Search start: today or (targetBy - 7 days) so we start filling early enough
      const searchStart = new Date(Math.max(today.getTime(), targetBy.getTime() - 7 * 24 * 60 * 60 * 1000));

      let placed = false;
      // Phase 1: search from searchStart → deadline
      for (let d = new Date(searchStart); d <= deadline && !placed; d.setDate(d.getDate() + 1)) {
        const jsDay = d.getDay(); // 0=Sun
        const dayIdx = (jsDay + 6) % 7; // Mon=0
        if (dailyCaps[dayIdx] === 0) continue; // weekend (or zero-weight day)

        const shortDay = daysOfWeek[dayIdx];
        const wkStart  = weekStartOf(d);
        initWeek(wkStart);
        const occupied = weekOccupied.get(wkStart)![shortDay];

        // Respect daily cap
        if (occupied.size >= dailyCaps[dayIdx]) continue;

        const free = workSlots.filter((s) => !occupied.has(s));
        if (free.length === 0) continue;

        const time = free[0];
        occupied.add(time);
        placements.push({ task, day: shortDay, time, wkStart });
        placed = true;
      }

      // Phase 2: fallback — find any free slot starting from today
      if (!placed) {
        for (let d = new Date(today); !placed; d.setDate(d.getDate() + 1)) {
          const jsDay = d.getDay();
          const dayIdx = (jsDay + 6) % 7;
          if (dailyCaps[dayIdx] === 0) continue;
          const shortDay = daysOfWeek[dayIdx];
          const wkStart  = weekStartOf(d);
          initWeek(wkStart);
          const occupied = weekOccupied.get(wkStart)![shortDay];
          const free = workSlots.filter((s) => !occupied.has(s));
          if (free.length > 0) {
            const time = free[0];
            occupied.add(time);
            placements.push({ task, day: shortDay, time, wkStart });
            placed = true;
          }
        }
      }
    }

    // Persist to DB and update UI for current week only
    const newSchedule = structuredClone(schedule) as Record<string, Record<string, CalTask[]>>;
    const dbWrites: Promise<any>[] = [];

    for (const { task, day, time, wkStart } of placements) {
      if (wkStart === weekStart) {
        newSchedule[day][time] = [...(newSchedule[day][time] ?? []), task];
      }
      if (user && task.id.includes("-")) {
        const fullDay = fullDayNames[daysOfWeek.indexOf(day)];
        dbWrites.push(upsertScheduledTask(user.id, task.id, fullDay, time, wkStart));
      }
    }

    await Promise.all(dbWrites);
    setSchedule(newSchedule);
    setAutoScheduling(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SidebarLayout>
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-neutral-50">

        {/* Week nav sub-bar */}
        <div className="border-b border-neutral-200 bg-white px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-neutral-200 h-7 w-7 p-0" aria-label="Previous week" onClick={() => setWeekOffset((o) => o - 1)}>
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="text-sm font-medium text-neutral-700 min-w-[130px] text-center">{currentWeek}</span>
            <Button variant="outline" size="sm" className="border-neutral-200 h-7 w-7 p-0" aria-label="Next week" onClick={() => setWeekOffset((o) => o + 1)}>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleGCalSync}
            disabled={syncing}
            className="bg-neutral-900 hover:bg-neutral-800 text-white h-7 text-xs"
          >
            {syncing ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <CalendarCheck className="size-3.5 mr-1" />}
            Sync to Google
          </Button>
        </div>

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">

          {/* Mobile toggle */}
          <div className="lg:hidden mb-4 flex gap-2">
            <Button
              onClick={() => setShowMobileInbox(true)}
              variant={showMobileInbox ? "default" : "outline"}
              className={showMobileInbox ? "bg-neutral-900 text-white" : ""}
              size="sm"
            >
              <List className="size-4 mr-2" />
              Task Inbox
            </Button>
            <Button
              onClick={() => setShowMobileInbox(false)}
              variant={!showMobileInbox ? "default" : "outline"}
              className={!showMobileInbox ? "bg-neutral-900 text-white" : ""}
              size="sm"
            >
              <CalendarIcon className="size-4 mr-2" />
              Calendar Grid
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 sm:gap-6">

            {/* ── LEFT: Task Inbox ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`${showMobileInbox ? "block" : "hidden"} lg:block`}
            >
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">

                  <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-neutral-900">Task Inbox</h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {inboxTasks.length} task{inboxTasks.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAutoSchedule}
                        disabled={autoScheduling || inboxTasks.filter(t => !t.completed).length === 0}
                        className="border-[#003262] text-[#003262] hover:bg-[#003262] hover:text-white text-xs transition-colors"
                        title="Auto-schedule tasks using your workload preferences"
                      >
                        {autoScheduling
                          ? <Loader2 className="size-3.5 mr-1 animate-spin" />
                          : <Wand2 className="size-3.5 mr-1" />}
                        AI Schedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/decomposition")}
                        className="border-neutral-300 text-neutral-700 text-xs"
                      >
                        <Plus className="size-3.5 mr-1" />
                        Add Tasks
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 max-h-[calc(100vh-22rem)] overflow-y-auto">
                    {inboxTasks.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="size-12 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
                          <List className="size-6 text-neutral-300" />
                        </div>
                        <p className="text-sm text-neutral-500 mb-3">No tasks yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/decomposition")}
                          className="border-neutral-300"
                        >
                          <Plus className="size-3.5 mr-1.5" />
                          Add Tasks from Canvas
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {inboxTasks.map((task) => (
                          <InboxTaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="border-t border-neutral-200 p-4 bg-neutral-50">
                    <p className="text-xs font-semibold text-neutral-700 mb-2">Categories</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {Object.entries(categoryConfig).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`size-3 rounded ${cfg.bg} border ${cfg.border}`} />
                          <span className="text-xs text-neutral-600">{cfg.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 p-4 bg-blue-50">
                    <div className="flex gap-2">
                      <Info className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Drag tasks into time slots · Click a scheduled task to open its workspace panel
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT: Calendar Grid ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`${!showMobileInbox ? "block" : "hidden"} lg:block bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden`}
            >
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-neutral-300 bg-neutral-50">
                    <div className="p-3 border-r border-neutral-200" />
                    {daysOfWeek.map((day, i) => {
                      const isToday = weekDates[i].toISOString().split("T")[0] === todayStr;
                      const dateLabel = weekDates[i].toLocaleString("en-US", { month: "short", day: "numeric" });
                      return (
                        <div
                          key={day}
                          className={`p-3 text-center border-r border-neutral-200 ${isToday ? "bg-yellow-50" : ""}`}
                        >
                          <div className={`text-xs font-semibold mb-0.5 ${isToday ? "text-[#FDB515]" : "text-neutral-500"}`}>{day}</div>
                          <div className={`text-lg font-bold ${isToday ? "text-[#FDB515]" : "text-neutral-900"}`}>
                            {weekDates[i].getDate()}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isToday ? "text-[#FDB515] font-semibold" : "text-neutral-400"}`}>
                            {isToday ? "Today" : dateLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  <div className="divide-y divide-neutral-200">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-[72px_repeat(7,1fr)]">
                        <div className="p-2 text-xs font-medium text-neutral-500 border-r border-neutral-200 bg-neutral-50 flex items-start pt-2">
                          {time}
                        </div>
                        {daysOfWeek.map((day, i) => (
                          <CalendarCell
                            key={`${day}-${time}`}
                            day={day}
                            time={time}
                            tasks={schedule[day]?.[time] ?? []}
                            isToday={weekDates[i].toISOString().split("T")[0] === todayStr}
                            onDrop={(task) => handleDrop(day, time, task)}
                            onOpen={openPanel}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-xs text-neutral-500">
                  {syncMessage
                    ? <span className="text-green-700 font-medium">{syncMessage}</span>
                    : "Click any scheduled task to open its workspace panel"}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Task side panel ── */}
        <AnimatePresence>
          {panel && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePanel}
                className="fixed inset-0 bg-black/20 z-30"
              />
              <TaskPanel
                panel={panel}
                onChange={handlePanelChange}
                onClose={closePanel}
                onSave={handlePanelSave}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
    </SidebarLayout>
  );
}
