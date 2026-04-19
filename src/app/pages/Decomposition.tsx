import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { createAssignment, createTasks } from "../../lib/database";
import { motion, AnimatePresence } from "motion/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Identifier, XYCoord } from "dnd-core";
import {
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  Brain,
  Clock,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GripVertical,
  Plus,
  Wand2,
  ListTodo,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { SidebarLayout } from "../components/Sidebar";

interface RawAssignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  description: string;
  canvasUrl: string;
}

interface DecomposedTask {
  id: string;
  name: string;
  category: "reading" | "problemset" | "discussion" | "preclass" | "reflection" | null;
  estimatedTime: string;
  suggestedDate: string;
  sourceAssignment: string;
  confidence: "high" | "medium" | "needs-review";
  difficulty: "easy" | "medium" | "hard" | null;
  details?: string;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const mockRawAssignment: RawAssignment = {
  id: "1",
  title: "Stay Current 7 - 8",
  course: "ENGIN 183D-SEM-001",
  dueDate: "Sunday by 11:59pm",
  description: `In this week's lecture we learnt a lot about the time scope quality trifecta and had some fun making decisions as a team during the game show. Now it's time to translate this into real prototypes.

Send me the email addresses of the team members that will collaborate on Lovable if you want to use our credits and have an experience collaborating. You can transfer your project to the space where you can all collaborate and transfer it out of the space after class is over. The IP remains yours.

1. Group Assignment 3.1: First Step: Create a working prototype (counts towards 3.1 and 3.2 group assignment of 15% of group grade)

Choose the CORE feature of your app and create a HAPPY PATH through the app to showcase the functionality. Less is more - 2-click delight.

Add a link to your clickable prototype to Miro

to be continued (this will not be graded until the entire group assignment 3 is completed)

2. Put your mission statement into GoZigZag https://gozigzag.com

Write a short 150-250 word summary of how you would evaluate the AI solution vs. what you have created to date.

Submit individually here in bCourses - this is not a group assignment

3. Preparation for next week:

Read DARE TO LAUNCH Page 155 - 166. Chapter 5 (Business Models)

4. In preparation for the class activity, create a BMC in Miro. Look at 2 (go ZigZag). In order to get a head start on your BMC.

4. For extra participation points: comment on each other's BMCs (quality of quantity)`,
  canvasUrl: "https://canvas.berkeley.edu/courses/123/assignments/456"
};

const aiDecomposedTasks: DecomposedTask[] = [
  {
    id: "1",
    name: "Send team member emails for Lovable collaboration",
    category: null,
    estimatedTime: "10 min",
    suggestedDate: "Mon, Mar 3",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Email team members who want to collaborate on Lovable. Use the provided credits for team collaboration space.",
  },
  {
    id: "2",
    name: "Choose CORE feature for app prototype",
    category: null,
    estimatedTime: "45 min",
    suggestedDate: "Tue, Mar 4",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Select the most important feature of your app for the Group Assignment 3.1 prototype.",
  },
  {
    id: "3",
    name: "Create HAPPY PATH through app (2-click delight)",
    category: null,
    estimatedTime: "2 hrs",
    suggestedDate: "Wed, Mar 5",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Build a working prototype showing the core functionality. Focus on simplicity - less is more.",
  },
  {
    id: "4",
    name: "Add clickable prototype link to Miro",
    category: null,
    estimatedTime: "15 min",
    suggestedDate: "Thu, Mar 6",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Upload your prototype link to the team Miro board for Group Assignment 3.1.",
  },
  {
    id: "5",
    name: "Write 150-250 word mission statement summary for GoZigZag",
    category: null,
    estimatedTime: "45 min",
    suggestedDate: "Thu, Mar 6",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Evaluate the AI solution compared to what you've created. Submit individually (not a group assignment).",
  },
  {
    id: "6",
    name: "Submit GoZigZag mission statement individually in bCourses",
    category: null,
    estimatedTime: "10 min",
    suggestedDate: "Fri, Mar 7",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Submit your mission statement to bCourses. This is an individual assignment.",
  },
  {
    id: "7",
    name: "Read DARE TO LAUNCH Page 155-166, Chapter 5 (Business Models)",
    category: null,
    estimatedTime: "60 min",
    suggestedDate: "Fri, Mar 7",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Preparation reading for next week's class on business models.",
  },
  {
    id: "8",
    name: "Create BMC in Miro using GoZigZag insights",
    category: null,
    estimatedTime: "1 hr",
    suggestedDate: "Sat, Mar 8",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "high",
    difficulty: null,
    details: "Prepare your Business Model Canvas in Miro. Reference your GoZigZag work for insights.",
  },
  {
    id: "9",
    name: "(Optional) Comment on other students' BMCs for participation points",
    category: null,
    estimatedTime: "30 min",
    suggestedDate: "Sat, Mar 8",
    sourceAssignment: "Stay Current 7 - 8",
    confidence: "medium",
    difficulty: null,
    details: "Extra participation points available. Focus on quality over quantity in your feedback.",
  },
];

const categoryConfig = {
  reading: { icon: BookOpen, label: "Reading", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  problemset: { icon: FileText, label: "Assignment", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  preclass: { icon: Brain, label: "Pre-Class", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  reflection: { icon: Sparkles, label: "Reflection", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" },
};

interface SelectionPopup {
  x: number;
  y: number;
  text: string;
}

// Highlight tasks and due dates in raw assignment text
function HighlightedAssignmentText({
  text,
  onTextSelect
}: {
  text: string;
  onTextSelect: (selectedText: string, rect: DOMRect) => void;
}) {
  const lines = text.split('\n');

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && selectedText.length > 3 && selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onTextSelect(selectedText, rect);
    }
  };

  return (
    <div
      className="prose prose-sm max-w-none text-neutral-700 leading-relaxed space-y-2 select-text"
      onMouseUp={handleMouseUp}
    >
      {lines.map((line, index) => {
        const isNumberedTask = /^\d+\.\s/.test(line.trim());
        const hasActionWord = /^(Choose|Create|Add|Write|Read|Submit|Send|Preparation|comment)/i.test(line.trim());
        const isSubTask = /^[-•]\s/.test(line.trim()) || line.trim().startsWith('to be continued');
        const hasDueDate = /due|deadline|by \d+/i.test(line);
        const hasGrading = /points|grade|percent|%/i.test(line);

        if (isNumberedTask) {
          return (
            <p key={index} className="!mb-2 !mt-3">
              <span className="font-bold text-neutral-900 bg-yellow-300 px-1.5 py-0.5 rounded">
                {line}
              </span>
            </p>
          );
        }
        if (hasActionWord && !isNumberedTask) {
          return (
            <p key={index} className="!mb-1 pl-4">
              <span className="text-blue-900 bg-blue-200 px-1.5 py-0.5 rounded font-semibold">
                {line}
              </span>
            </p>
          );
        }
        if (hasDueDate || hasGrading) {
          return (
            <p key={index} className="!mb-1">
              <span className="text-red-800 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded font-medium">
                {line}
              </span>
            </p>
          );
        }
        if (isSubTask) {
          return (
            <p key={index} className="!mb-1 pl-6 text-neutral-600">
              {line}
            </p>
          );
        }
        return (
          <p key={index} className="!mb-1 text-neutral-600">
            {line || '\u00A0'}
          </p>
        );
      })}
    </div>
  );
}

interface DraggableTaskProps {
  task: DecomposedTask;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<DecomposedTask>) => void;
}

function DraggableTask({ task, index, moveTask, onUpdateTask }: DraggableTaskProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: "task",
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "task",
    item: () => ({ id: task.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  preview(drop(ref));

  const difficultyConfig = {
    easy: { label: "E", color: "text-green-700", bg: "bg-green-100", border: "border-green-300" },
    medium: { label: "M", color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-300" },
    hard: { label: "H", color: "text-red-700", bg: "bg-red-100", border: "border-red-300" },
  };

  return (
    <div ref={ref} data-handler-id={handlerId}>
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`w-full group flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer ${
          isDragging ? "opacity-40" : "opacity-100"
        } ${showDetails ? "border-blue-300" : ""}`}
      >
        {/* Drag Handle */}
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-5" />
        </div>

        {/* Rank Number */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold text-neutral-600">
          {index + 1}
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-neutral-900 mb-1.5">{task.name}</p>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="size-3.5" />
            <span>Due Date: {task.suggestedDate}</span>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowDifficultyMenu(!showDifficultyMenu)}
            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
              task.difficulty
                ? `${difficultyConfig[task.difficulty].bg} ${difficultyConfig[task.difficulty].border} ${difficultyConfig[task.difficulty].color}`
                : "border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
            }`}
          >
            {task.difficulty ? difficultyConfig[task.difficulty].label : "?"}
          </button>
          {showDifficultyMenu && (
            <div className="absolute right-0 top-10 z-50 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 w-32">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => { onUpdateTask(task.id, { difficulty: d }); setShowDifficultyMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2`}
                >
                  <span className={`w-6 h-6 rounded ${difficultyConfig[d].bg} border ${difficultyConfig[d].border} ${difficultyConfig[d].color} flex items-center justify-center text-xs font-bold`}>
                    {difficultyConfig[d].label}
                  </span>
                  <span className="capitalize">{d}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Selector */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              task.category
                ? `${categoryConfig[task.category].bg} ${categoryConfig[task.category].border}`
                : "border-dashed border-neutral-300 bg-neutral-50 hover:border-neutral-400"
            }`}
          >
            {task.category ? (
              <>
                {(() => {
                  const Icon = categoryConfig[task.category].icon;
                  return <Icon className={`size-4 ${categoryConfig[task.category].color}`} />;
                })()}
                <span className={`text-xs font-medium ${categoryConfig[task.category].color}`}>
                  {categoryConfig[task.category].label}
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-neutral-500">Set Type</span>
            )}
          </button>
          {showCategoryMenu && (
            <div className="absolute right-0 top-10 z-50 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 w-40">
              {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
                const config = categoryConfig[key];
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => { onUpdateTask(task.id, { category: key }); setShowCategoryMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Icon className={`size-4 ${config.color}`} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Expansion */}
      {showDetails && task.details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 ml-14 mr-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-neutral-700"
        >
          {task.details}
        </motion.div>
      )}
    </div>
  );
}

function DecompositionContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decomposing, setDecomposing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<DecomposedTask[]>([]);
  const [selectionPopup, setSelectionPopup] = useState<SelectionPopup | null>(null);

  const hasTasks = tasks.length > 0;

  useEffect(() => { document.title = "Decompose Assignments — CalDaily"; }, []);

  // Dismiss popup on any click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const popup = document.getElementById("selection-popup");
      if (popup && !popup.contains(e.target as Node)) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const handleTextSelect = useCallback((text: string, rect: DOMRect) => {
    setSelectionPopup({
      x: rect.left + rect.width / 2,
      y: rect.top - 8, // just above the selection
      text,
    });
  }, []);

  const handleCreateFromSelection = () => {
    if (!selectionPopup) return;
    const newTask: DecomposedTask = {
      id: `manual-${Date.now()}`,
      name: selectionPopup.text.slice(0, 120), // cap at 120 chars
      category: null,
      estimatedTime: "30 min",
      suggestedDate: "Sun, Mar 16",
      sourceAssignment: mockRawAssignment.title,
      confidence: "high",
      difficulty: null,
      details: selectionPopup.text,
    };
    setTasks((prev) => [...prev, newTask]);
    setSelectionPopup(null);
    // Clear the browser text selection
    window.getSelection()?.removeAllRanges();
  };

  const handleDecompose = () => {
    setDecomposing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDecomposing(false);
          setTasks(aiDecomposedTasks);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const handleContinueToCalendar = async () => {
    if (user) {
      setSaving(true);
      try {
        const assignment = await createAssignment(user.id, {
          canvas_id: mockRawAssignment.id,
          title: mockRawAssignment.title,
          course: mockRawAssignment.course,
          due_date: mockRawAssignment.dueDate,
          description: mockRawAssignment.description,
          canvas_url: mockRawAssignment.canvasUrl,
          is_upcoming: true,
        });

        await createTasks(
          user.id,
          tasks.map((t, i) => ({
            assignment_id: assignment?.id ?? null,
            name: t.name,
            category: t.category,
            estimated_time: t.estimatedTime,
            suggested_date: t.suggestedDate,
            difficulty: t.difficulty,
            details: t.details,
            source_assignment: t.sourceAssignment,
            position: i,
          }))
        );

        navigate("/calendar");
      } catch (err) {
        console.error("Failed to save tasks to Supabase:", err);
        navigate("/calendar");
      } finally {
        setSaving(false);
      }
    } else {
      // Unauthenticated: persist to localStorage so Calendar inbox can read them
      localStorage.setItem("workspaceUnscheduled", JSON.stringify(
        tasks.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          estimated_time: t.estimatedTime,
          suggested_date: t.suggestedDate,
          source_assignment: t.sourceAssignment,
          difficulty: t.difficulty,
          details: t.details,
        }))
      ));
      navigate("/calendar");
    }
  };

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const updated = [...tasks];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    setTasks(updated);
  };

  const onUpdateTask = (taskId: string, updates: Partial<DecomposedTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Floating selection popup — rendered at viewport level */}
      {selectionPopup && (
        <div
          id="selection-popup"
          className="fixed z-[100] transform -translate-x-1/2 -translate-y-full"
          style={{ left: selectionPopup.x, top: selectionPopup.y }}
        >
          <div className="bg-neutral-900 rounded-lg shadow-xl px-1 py-1 flex items-center gap-1">
            <button
              onMouseDown={(e) => { e.preventDefault(); handleCreateFromSelection(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
            >
              <Plus className="size-3.5" />
              Create Task from Selection
            </button>
          </div>
          {/* Arrow pointing down */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-semibold text-neutral-900 mb-2 sm:mb-3">
            Coursework Decomposition Engine
          </h1>
          <p className="text-base sm:text-lg text-neutral-600">
            Transforming fragmented Canvas assignments into structured, execution-ready tasks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* LEFT: Raw Canvas Assignment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-2 bg-red-500 rounded-full" />
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                  Before: Raw Canvas Assignment
                </h2>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                {/* Assignment Header */}
                <div className="bg-neutral-50 border-b border-neutral-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900">{mockRawAssignment.title}</h3>
                    <a
                      href={mockRawAssignment.canvasUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                  <p className="text-sm text-neutral-600 mb-1">{mockRawAssignment.course}</p>
                  <p className="text-sm text-neutral-500">Due {mockRawAssignment.dueDate}</p>
                </div>

                {/* Selection hint banner */}
                <div className="mx-4 mt-3 mb-0 rounded-xl bg-amber-50 border-2 border-amber-300 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 bg-amber-100">
                    <span className="text-xl">✏️</span>
                    <p className="text-sm font-bold text-amber-900">
                      Try it: highlight any text below to create a task
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-amber-800 mb-2 font-medium">For example, select text like this:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold bg-blue-600 text-white select-none shadow-sm">
                        "Choose the CORE feature of your app"
                      </div>
                      <span className="text-amber-700 text-lg">→</span>
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold shadow-sm whitespace-nowrap">
                        <Plus className="size-3.5" />
                        Create Task
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-2">
                      Mix manual selections with AI decomposition for full control.
                    </p>
                  </div>
                </div>

                {/* Assignment Description */}
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  <HighlightedAssignmentText
                    text={mockRawAssignment.description}
                    onTextSelect={handleTextSelect}
                  />
                </div>

                {/* Decomposing Progress (shown inside left panel while animating) */}
                {decomposing && (
                  <div className="p-4 border-t border-neutral-200 bg-neutral-50">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Analyzing assignment...</span>
                      <span className="text-neutral-900 font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-neutral-500 mt-2">
                      Extracting hidden tasks, estimating time, structuring workflow...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Decomposed Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${hasTasks ? 'bg-green-500' : 'bg-neutral-300'}`} />
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                  After: Priority-Ranked Tasks
                </h2>
              </div>
              {hasTasks && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <GripVertical className="size-3.5" />
                  <span>Drag to reorder</span>
                </div>
              )}
            </div>

            {/* Top action buttons */}
            {!decomposing && (
              <div className="mb-4 flex flex-col gap-2">
                {hasTasks && (
                  <Button
                    onClick={handleContinueToCalendar}
                    disabled={saving}
                    size="lg"
                    className="w-full text-white font-semibold"
                    style={{ backgroundColor: "#003262" }}
                  >
                    {saving ? (
                      <><Wand2 className="size-4 mr-2 animate-spin" />Saving tasks…</>
                    ) : (
                      <><Calendar className="size-4 mr-2" />Continue to Calendar<ChevronRight className="size-4 ml-2" /></>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handleDecompose}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  <Wand2 className="size-4 mr-2" />
                  {hasTasks ? "Re-run AI Decomposition" : "AI Assist — Decompose All"}
                </Button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* Decomposing animation */}
              {decomposing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg border border-neutral-200 p-12 text-center"
                >
                  <div className="size-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="size-8 text-blue-600" />
                  </div>
                  <p className="text-neutral-600 font-medium">Decomposing assignment...</p>
                  <p className="text-sm text-neutral-500 mt-2">AI is extracting micro-tasks</p>
                </motion.div>
              )}

              {/* Empty state */}
              {!decomposing && !hasTasks && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg border-2 border-dashed border-neutral-200 p-12 text-center"
                >
                  <div className="size-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                    <ListTodo className="size-8 text-neutral-300" />
                  </div>
                  <p className="text-neutral-500 font-medium mb-1">Your tasks will appear here</p>
                  <p className="text-sm text-neutral-400">
                    Use AI Assist above, or highlight text on the left to add tasks manually.
                  </p>
                </motion.div>
              )}

              {/* Tasks list */}
              {!decomposing && hasTasks && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="size-5 text-green-600" />
                      <h3 className="font-semibold text-neutral-900">
                        {tasks.length} task{tasks.length !== 1 ? "s" : ""} ready
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      Drag to prioritize · Set type on each task · Highlight left panel to add more
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-neutral-500" />
                      <span className="text-neutral-600">
                        Total estimated time: <span className="font-semibold">4.2 hours</span>
                      </span>
                    </div>
                  </div>

                  {/* Ranked Task List */}
                  <div className="space-y-2">
                    {tasks.map((task, index) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        index={index}
                        moveTask={moveTask}
                        onUpdateTask={onUpdateTask}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-neutral-500 text-center pt-2">
                    {user ? "Tasks will be saved to your account" : "Sign in to save your tasks across sessions"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Decomposition() {
  return (
    <SidebarLayout>
      <DndProvider backend={HTML5Backend}>
        <DecompositionContent />
      </DndProvider>
    </SidebarLayout>
  );
}
