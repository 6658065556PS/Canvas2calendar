import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Wand2, Plus, BookOpen, FileText, MessageSquare, Brain, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

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

const categoryConfig = {
  reading: { icon: BookOpen, label: "Reading", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  problemset: { icon: FileText, label: "Assignment", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  discussion: { icon: MessageSquare, label: "Discussion", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  preclass: { icon: Brain, label: "Pre-Class", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  reflection: { icon: Sparkles, label: "Reflection", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" },
};

interface ManualTaskModalProps {
  selectedText: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: Partial<DecomposedTask>) => void;
}

export function ManualTaskModal({ selectedText, isOpen, onClose, onCreateTask }: ManualTaskModalProps) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [taskName, setTaskName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("30 min");
  const [suggestedDate, setSuggestedDate] = useState("Mon, Mar 10");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [category, setCategory] = useState<"reading" | "problemset" | "discussion" | "preclass" | "reflection" | null>(null);
  
  const handleSubmit = () => {
    if (mode === "manual") {
      onCreateTask({
        name: taskName || selectedText,
        estimatedTime,
        suggestedDate,
        difficulty,
        category,
        details: selectedText,
      });
    } else {
      // AI mode - auto-fill with smart defaults based on selected text
      const aiGeneratedTask: Partial<DecomposedTask> = {
        name: taskName || selectedText.slice(0, 100),
        estimatedTime: "30 min",
        suggestedDate: "Mon, Mar 10",
        difficulty: "medium",
        category: null,
        details: selectedText,
      };
      onCreateTask(aiGeneratedTask);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Create Task from Selection</h2>
              <p className="text-sm text-neutral-500 mt-1">Choose how to create your task</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="size-5 text-neutral-400" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="p-6 bg-neutral-50 border-b border-neutral-200">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("manual")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${ 
                  mode === "manual"
                    ? "border-blue-600 bg-blue-50"
                    : "border-neutral-300 bg-white hover:border-neutral-400"
                }`}
              >
                <Plus className={`size-6 ${mode === "manual" ? "text-blue-600" : "text-neutral-400"}`} />
                <div className="text-center">
                  <div className={`font-semibold ${mode === "manual" ? "text-blue-900" : "text-neutral-700"}`}>
                    Manual Entry
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Like writing in your notebook
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("ai")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  mode === "ai"
                    ? "border-purple-600 bg-purple-50"
                    : "border-neutral-300 bg-white hover:border-neutral-400"
                }`}
              >
                <Wand2 className={`size-6 ${mode === "ai" ? "text-purple-600" : "text-neutral-400"}`} />
                <div className="text-center">
                  <div className={`font-semibold ${mode === "ai" ? "text-purple-900" : "text-neutral-700"}`}>
                    AI Assist
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Smart suggestions
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Selected Text */}
          <div className="p-6 border-b border-neutral-200">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Selected from Assignment:
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-neutral-700 max-h-32 overflow-y-auto">
              {selectedText}
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-4">
            {mode === "manual" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="e.g., 30 min, 2 hrs"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="text"
                      value={suggestedDate}
                      onChange={(e) => setSuggestedDate(e.target.value)}
                      placeholder="e.g., Mon, Mar 10"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDifficulty("easy")}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition-all ${
                        difficulty === "easy"
                          ? "border-green-600 bg-green-100 text-green-800"
                          : "border-neutral-300 text-neutral-600 hover:border-green-400"
                      }`}
                    >
                      E - Easy
                    </button>
                    <button
                      onClick={() => setDifficulty("medium")}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition-all ${
                        difficulty === "medium"
                          ? "border-orange-600 bg-orange-100 text-orange-800"
                          : "border-neutral-300 text-neutral-600 hover:border-orange-400"
                      }`}
                    >
                      M - Medium
                    </button>
                    <button
                      onClick={() => setDifficulty("hard")}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold transition-all ${
                        difficulty === "hard"
                          ? "border-red-600 bg-red-100 text-red-800"
                          : "border-neutral-300 text-neutral-600 hover:border-red-400"
                      }`}
                    >
                      H - Hard
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Task Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
                      const config = categoryConfig[key];
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setCategory(key)}
                          className={`flex items-center gap-2 py-2 px-3 rounded-lg border-2 transition-all ${
                            category === key
                              ? `${config.border} ${config.bg}`
                              : "border-neutral-300 hover:border-neutral-400"
                          }`}
                        >
                          <Icon className={`size-4 ${category === key ? config.color : "text-neutral-400"}`} />
                          <span className={`text-sm font-medium ${category === key ? config.color : "text-neutral-600"}`}>
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {mode === "ai" && (
              <div className="text-center py-8">
                <div className="size-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Wand2 className="size-8 text-purple-600" />
                </div>
                <p className="text-neutral-600 mb-4">
                  AI will automatically extract task details, estimate time, and suggest a due date based on your selection.
                </p>
                <p className="text-sm text-neutral-500">
                  You can still edit the task after creation.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mode === "manual" && !taskName.trim()}
              className="px-6 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {mode === "manual" ? (
                <>
                  <Plus className="size-4 mr-2" />
                  Create Task
                </>
              ) : (
                <>
                  <Wand2 className="size-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
