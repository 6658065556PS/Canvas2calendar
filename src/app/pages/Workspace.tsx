import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  upsertScheduledTask,
  removeScheduledTask,
  getScheduledTasksForWeek,
  getWeekStart,
} from "../../lib/database";
import { motion, AnimatePresence } from "motion/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Clock, GripVertical, Copy, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { AppNav } from "../components/AppNav";

interface Task {
  id: string;
  name: string;
  course: string;
  estimatedTime: string;
  dueDate: string;
  category: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  details?: string;
  notes?: string;
}

interface ScheduledTask extends Task {
  day: string;
  time: string;
}

const ItemType = "TASK";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeekDates(): string[] {
  const sunday = new Date(getWeekStart());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
}

const dates = buildWeekDates();

const timeSlots = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
  "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
];

const categoryColors: Record<string, string> = {
  reading: "bg-blue-50 border-blue-300",
  problemset: "bg-purple-50 border-purple-300",
  discussion: "bg-green-50 border-green-300",
  preclass: "bg-orange-50 border-orange-300",
  reflection: "bg-pink-50 border-pink-300",
};

const categoryLabels: Record<string, string> = {
  reading: "Reading",
  problemset: "Problem Set",
  discussion: "Discussion",
  preclass: "Pre-Class",
  reflection: "Reflection",
};

const difficultyLabels: Record<string, string> = {
  easy: "E",
  medium: "M",
  hard: "H",
};

const difficultyColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-green-100", text: "text-green-800" },
  medium: { bg: "bg-orange-100", text: "text-orange-800" },
  hard: { bg: "bg-red-100", text: "text-red-800" },
};

function ScheduledTaskCard({ 
  task, 
  onDuplicate, 
  onRemove,
  onUpdateNotes 
}: { 
  task: ScheduledTask; 
  onDuplicate: (task: ScheduledTask) => void;
  onRemove: (taskId: string, day: string, time: string) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(task.notes || "");

  const bgColor = task.category ? categoryColors[task.category] || "bg-neutral-50 border-neutral-300" : "bg-neutral-50 border-neutral-300";

  const handleSaveNotes = () => {
    onUpdateNotes(task.id, notesValue);
    setEditingNotes(false);
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { task, fromSchedule: true, day: task.day, time: task.time },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`${bgColor} border rounded-md p-2 transition-all cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="size-3 text-neutral-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 className="text-xs font-medium text-neutral-900 line-clamp-2 flex-1">
              {task.name}
            </h4>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 hover:bg-neutral-200/50 rounded transition-colors flex-shrink-0"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Due Date in RED */}
            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
              Due: {task.dueDate}
            </span>
            
            {/* Difficulty Badge */}
            {task.difficulty && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${difficultyColors[task.difficulty].bg} ${difficultyColors[task.difficulty].text}`}>
                {difficultyLabels[task.difficulty]}
              </span>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                <div className="pt-2 border-t border-neutral-200/50">
                  <p className="text-[10px] text-neutral-600 mb-1">
                    <span className="font-medium">Course:</span> {task.course}
                  </p>
                  <p className="text-[10px] text-neutral-600 mb-1">
                    <span className="font-medium">Est. Time:</span> {task.estimatedTime}
                  </p>
                  {task.category && (
                    <p className="text-[10px] text-neutral-600 mb-1">
                      <span className="font-medium">Type:</span> {task.category}
                    </p>
                  )}
                  {task.details && (
                    <p className="text-[10px] text-neutral-600 mb-2">
                      <span className="font-medium">Details:</span> {task.details}
                    </p>
                  )}
                  
                  {/* Notes Section */}
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-neutral-700 mb-1">Notes:</p>
                    {editingNotes ? (
                      <div>
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add your notes here..."
                          className="w-full text-[10px] px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={handleSaveNotes}
                            className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setNotesValue(task.notes || "");
                              setEditingNotes(false);
                            }}
                            className="text-[10px] px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded hover:bg-neutral-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingNotes(true)}
                        className="w-full text-left text-[10px] px-2 py-1.5 bg-white border border-neutral-200 rounded hover:border-blue-400 transition-colors"
                      >
                        {task.notes || "Click to add notes..."}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => onDuplicate(task)}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] px-2 py-1 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                    >
                      <Copy className="size-3" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => onRemove(task.id, task.day, task.time)}
                      className="flex items-center justify-center gap-1 text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TimeSlotCell({ 
  day, 
  time, 
  task, 
  onDrop,
  onDuplicate,
  onRemove,
  onUpdateNotes
}: { 
  day: string; 
  time: string; 
  task: ScheduledTask | null;
  onDrop: (day: string, time: string, task: Task) => void;
  onDuplicate: (task: ScheduledTask) => void;
  onRemove: (taskId: string, day: string, time: string) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: { task: Task; fromSchedule?: boolean; day?: string; time?: string }) => {
      onDrop(day, time, item.task);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`border border-neutral-200 p-1 min-h-[60px] transition-colors ${
        isOver ? "bg-blue-50 border-blue-400" : task ? "" : "hover:bg-neutral-50"
      }`}
    >
      {task && (
        <ScheduledTaskCard 
          task={task} 
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onUpdateNotes={onUpdateNotes}
        />
      )}
    </div>
  );
}

function UnscheduledTaskCard({ 
  task, 
  index 
}: { 
  task: Task; 
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const bgColor = task.category ? categoryColors[task.category] || "bg-white border-neutral-300" : "bg-white border-neutral-300";

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { task, fromSchedule: false },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div className="relative">
      {/* Priority Badge */}
      <div className="absolute -left-2 top-2 z-10 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-sm">
        {index + 1}
      </div>
      
      <div
        ref={drag}
        className={`${bgColor} border rounded-lg p-3 cursor-move transition-all ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="size-4 text-neutral-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-neutral-900 flex-1">
                {task.name}
              </h4>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-neutral-200/50 rounded transition-colors flex-shrink-0"
              >
                {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {/* Due Date in RED */}
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                Due: {task.dueDate}
              </span>
              
              {/* Difficulty Badge */}
              {task.difficulty && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColors[task.difficulty].bg} ${difficultyColors[task.difficulty].text}`}>
                  {difficultyLabels[task.difficulty]}
                </span>
              )}

              {/* Category Badge */}
              {task.category && (
                <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                  {categoryLabels[task.category]}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600">
              <Clock className="size-3 inline mr-1" />
              {task.estimatedTime}
            </p>

            {/* Expanded Details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-neutral-200 overflow-hidden"
                >
                  <p className="text-xs text-neutral-600 mb-2">
                    <span className="font-medium">Course:</span> {task.course}
                  </p>
                  {task.details && (
                    <p className="text-xs text-neutral-600">
                      <span className="font-medium">Details:</span> {task.details}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const weekStart = getWeekStart();

  const prioritizedTasks = location.state?.prioritizedTasks;

  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<Record<string, Record<string, ScheduledTask | null>>>(() => {
    const initialSchedule: Record<string, Record<string, ScheduledTask | null>> = {};
    daysOfWeek.forEach(day => {
      initialSchedule[day] = {};
      timeSlots.forEach(time => {
        initialSchedule[day][time] = null;
      });
    });
    return initialSchedule;
  });

  useEffect(() => { document.title = "Workspace — CalDaily"; }, []);

  // Load tasks from Decomposition state, Supabase (if auth'd), or localStorage
  useEffect(() => {
    if (prioritizedTasks && prioritizedTasks.length > 0) {
      const convertedTasks: Task[] = prioritizedTasks.map((task: any) => ({
        id: task.id,
        name: task.name,
        course: task.sourceAssignment || "Canvas",
        estimatedTime: task.estimatedTime || task.estimated_time,
        dueDate: task.suggestedDate || task.suggested_date,
        category: task.category || null,
        difficulty: task.difficulty || null,
        details: task.details || undefined,
        notes: undefined,
      }));
      setUnscheduledTasks(convertedTasks);
      localStorage.setItem("workspaceUnscheduled", JSON.stringify(convertedTasks));
    } else if (user) {
      // Authenticated with no new tasks passed — load existing scheduled tasks from DB
      getScheduledTasksForWeek(user.id, weekStart).then((rows) => {
        if (rows.length === 0) {
          // Fall back to localStorage
          const saved = localStorage.getItem("workspaceUnscheduled");
          if (saved) setUnscheduledTasks(JSON.parse(saved));
          return;
        }

        // Rebuild the schedule grid from DB rows
        const newSchedule: Record<string, Record<string, ScheduledTask | null>> = {};
        daysOfWeek.forEach(day => {
          newSchedule[day] = {};
          timeSlots.forEach(time => { newSchedule[day][time] = null; });
        });

        rows.forEach((row: any) => {
          if (!row.task) return;
          const t = row.task;
          newSchedule[row.day][row.time_slot] = {
            id: t.id,
            name: t.name,
            course: t.source_assignment || "Canvas",
            estimatedTime: t.estimated_time || "30 min",
            dueDate: t.suggested_date || "",
            category: t.category || null,
            difficulty: t.difficulty || null,
            details: t.details || undefined,
            notes: t.notes || undefined,
            day: row.day,
            time: row.time_slot,
          };
        });
        setSchedule(newSchedule);
      });
    } else {
      const savedSchedule = localStorage.getItem("workspaceSchedule");
      const savedUnscheduled = localStorage.getItem("workspaceUnscheduled");
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
      if (savedUnscheduled) setUnscheduledTasks(JSON.parse(savedUnscheduled));
    }
  }, [prioritizedTasks, user, weekStart]);

  // Keep localStorage in sync as a fallback for unauthenticated sessions
  useEffect(() => {
    localStorage.setItem("workspaceSchedule", JSON.stringify(schedule));
    localStorage.setItem("workspaceUnscheduled", JSON.stringify(unscheduledTasks));
  }, [schedule, unscheduledTasks]);


  const handleDrop = (day: string, time: string, task: Task) => {
    // Check if the slot is already occupied by a different task
    if (schedule[day][time] !== null && schedule[day][time]?.id !== task.id) {
      const { day: _, time: __, ...taskWithoutSchedule } = task as any;
      const isAlreadyUnscheduled = unscheduledTasks.some(t => t.id === task.id);
      if (!isAlreadyUnscheduled) {
        setUnscheduledTasks(prev => [taskWithoutSchedule as Task, ...prev]);
      }
      setSchedule(prev => {
        const newSchedule = { ...prev };
        Object.keys(newSchedule).forEach(d => {
          Object.keys(newSchedule[d]).forEach(t => {
            if (newSchedule[d][t]?.id === task.id) {
              newSchedule[d][t] = null;
            }
          });
        });
        return newSchedule;
      });
      return;
    }

    const scheduledTask: ScheduledTask = { ...task, day, time };

    setSchedule(prev => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(d => {
        Object.keys(newSchedule[d]).forEach(t => {
          if (newSchedule[d][t]?.id === task.id) {
            newSchedule[d][t] = null;
          }
        });
      });
      newSchedule[day][time] = scheduledTask;
      return newSchedule;
    });

    setUnscheduledTasks(prev => prev.filter(t => t.id !== task.id));

    // Persist to Supabase if the task has a real DB UUID
    if (user && task.id && task.id.includes('-')) {
      upsertScheduledTask(user.id, task.id, day, time, weekStart).catch(console.error);
    }
  };

  const handleDuplicate = (task: ScheduledTask) => {
    const newTask: Task = {
      ...task,
      id: `${task.id}-dup-${Date.now()}`,
    };
    setUnscheduledTasks(prev => [newTask, ...prev]);
  };

  const handleRemove = (taskId: string, day: string, time: string) => {
    const task = schedule[day][time];
    if (!task) return;

    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [time]: null },
    }));

    const { day: _, time: __, ...taskWithoutSchedule } = task;
    setUnscheduledTasks(prev => [...prev, taskWithoutSchedule as Task]);

    // Remove from Supabase
    if (user && taskId.includes('-')) {
      removeScheduledTask(user.id, taskId, weekStart).catch(console.error);
    }
  };

  const handleUpdateNotes = (taskId: string, notes: string) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(day => {
        Object.keys(newSchedule[day]).forEach(time => {
          if (newSchedule[day][time]?.id === taskId) {
            newSchedule[day][time] = {
              ...newSchedule[day][time]!,
              notes,
            };
          }
        });
      });
      return newSchedule;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppNav
        backTo="/decomposition"
        rightContent={
          <Button
            size="sm"
            onClick={() => navigate("/calendar")}
            className="bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            Continue to Calendar →
          </Button>
        }
      />

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
            Weekly Time-Blocking Workspace
          </h1>
          <p className="text-neutral-600 mb-2">
            Drag tasks into specific time slots to plan your week. Duplicate tasks to schedule across multiple days.
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>🔴 Red badges = Due dates</span>
            <span>•</span>
            <span>📋 Click task to expand details & notes</span>
            <span>•</span>
            <span>📑 Duplicate to schedule across multiple slots</span>
          </div>
        </motion.div>

        {/* Layout */}
        <div className="grid grid-cols-[300px_1fr] gap-6">
          {/* Left Sidebar: Unscheduled Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="p-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-neutral-900 mb-1">Unscheduled Tasks</h2>
              <p className="text-sm text-neutral-500">{unscheduledTasks.length} remaining</p>
            </div>
            <div className="p-3 space-y-3">
              {unscheduledTasks.map((task, index) => (
                <UnscheduledTaskCard key={task.id} task={task} index={index} />
              ))}
              {unscheduledTasks.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-8">
                  All tasks scheduled! 🎉
                </p>
              )}
            </div>
          </motion.div>

          {/* Right: Time-Slot Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-x-auto"
          >
            <div className="min-w-[1200px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b border-neutral-200 sticky top-0 bg-white z-10">
                <div className="p-3 border-r border-neutral-200 bg-neutral-50">
                  <span className="text-xs font-medium text-neutral-600">Time</span>
                </div>
                {shortDays.map((day, index) => (
                  <div key={day} className="p-3 border-r border-neutral-200 last:border-r-0">
                    <div className="text-sm font-semibold text-neutral-900">{day}</div>
                    <div className="text-xs text-neutral-500">{dates[index]}</div>
                  </div>
                ))}
              </div>

              {/* Time Slot Rows */}
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-neutral-200 last:border-b-0">
                  <div className="p-2 border-r border-neutral-200 bg-neutral-50 flex items-start">
                    <span className="text-xs font-medium text-neutral-600">{time}</span>
                  </div>
                  {daysOfWeek.map((day) => (
                    <TimeSlotCell
                      key={`${day}-${time}`}
                      day={day}
                      time={time}
                      task={schedule[day][time]}
                      onDrop={handleDrop}
                      onDuplicate={handleDuplicate}
                      onRemove={handleRemove}
                      onUpdateNotes={handleUpdateNotes}
                    />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Workspace() {
  return (
    <DndProvider backend={HTML5Backend}>
      <WorkspaceContent />
    </DndProvider>
  );
}