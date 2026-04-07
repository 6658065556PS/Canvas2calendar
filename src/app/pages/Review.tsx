import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, FileText, MessageSquare, Brain, Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { AppNav } from "../components/AppNav";

interface Task {
  id: string;
  name: string;
  module: string;
  estimatedTime: string;
  suggestedDueDate: string;
  category: "reading" | "problemset" | "discussion" | "preclass";
  checked: boolean;
}

const mockTasks: Task[] = [
  {
    id: "1",
    name: "Read Chapter 4: Neural Network Fundamentals",
    module: "Week 4: Machine Learning Basics",
    estimatedTime: "45 min",
    suggestedDueDate: "Mon, Feb 14",
    category: "reading",
    checked: true,
  },
  {
    id: "2",
    name: "Read Research Paper: Attention Mechanisms",
    module: "Week 4: Machine Learning Basics",
    estimatedTime: "1 hr",
    suggestedDueDate: "Mon, Feb 14",
    category: "reading",
    checked: true,
  },
  {
    id: "3",
    name: "Problem Set 3: Questions 1-3",
    module: "Problem Set 3",
    estimatedTime: "2 hrs",
    suggestedDueDate: "Tue, Feb 15",
    category: "problemset",
    checked: true,
  },
  {
    id: "4",
    name: "Problem Set 3: Questions 4-6",
    module: "Problem Set 3",
    estimatedTime: "1.5 hrs",
    suggestedDueDate: "Wed, Feb 16",
    category: "problemset",
    checked: true,
  },
  {
    id: "5",
    name: "Problem Set 3: Coding Challenge",
    module: "Problem Set 3",
    estimatedTime: "3 hrs",
    suggestedDueDate: "Thu, Feb 17",
    category: "problemset",
    checked: true,
  },
  {
    id: "6",
    name: "Initial Discussion Post: Ethics in AI",
    module: "Discussion: Ethics in AI",
    estimatedTime: "30 min",
    suggestedDueDate: "Wed, Feb 16",
    category: "discussion",
    checked: true,
  },
  {
    id: "7",
    name: "Reply to 2 Peer Posts",
    module: "Discussion: Ethics in AI",
    estimatedTime: "20 min",
    suggestedDueDate: "Fri, Feb 18",
    category: "discussion",
    checked: true,
  },
  {
    id: "8",
    name: "Watch Pre-Lecture Video: Backpropagation",
    module: "Week 4: Machine Learning Basics",
    estimatedTime: "25 min",
    suggestedDueDate: "Mon, Feb 14",
    category: "preclass",
    checked: true,
  },
  {
    id: "9",
    name: "Complete Pre-Class Quiz",
    module: "Week 4: Machine Learning Basics",
    estimatedTime: "15 min",
    suggestedDueDate: "Mon, Feb 14",
    category: "preclass",
    checked: true,
  },
];

const categoryConfig = {
  reading: { icon: BookOpen, label: "Readings", color: "text-blue-600", bg: "bg-blue-50" },
  problemset: { icon: FileText, label: "Problem Sets", color: "text-purple-600", bg: "bg-purple-50" },
  discussion: { icon: MessageSquare, label: "Discussions", color: "text-green-600", bg: "bg-green-50" },
  preclass: { icon: Brain, label: "Pre-Class Work", color: "text-orange-600", bg: "bg-orange-50" },
};

export function Review() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(mockTasks);

  useEffect(() => { document.title = "Review Tasks — CalDaily"; }, []);
  const [editingTask, setEditingTask] = useState<{ taskId: string; field: 'name' | 'time' } | null>(null);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, checked: !task.checked } : task))
    );
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleSaveField = (taskId: string, field: string, value: string) => {
    if (field === 'name' && value.trim()) {
      updateTask(taskId, { name: value });
    } else if (field === 'time' && value.trim()) {
      updateTask(taskId, { estimatedTime: value });
    }
    setEditingTask(null);
  };

  const approveAll = () => {
    navigate("/calendar");
  };

  const groupedTasks = Object.entries(
    tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, Task[]>)
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppNav backTo="/decomposition" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-semibold text-neutral-900 mb-3">
            Here's what your week actually contains.
          </h1>
          <p className="text-lg text-neutral-600">
            We found <span className="font-semibold">{tasks.length} execution-ready tasks</span> hidden in your Canvas modules.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          <Button
            size="lg"
            onClick={approveAll}
            className="bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            Approve All
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={approveAll}
            className="border-neutral-300"
          >
            Review Individually
          </Button>
        </motion.div>

        {/* Task Groups */}
        <div className="space-y-8">
          {groupedTasks.map(([category, categoryTasks], groupIndex) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            const Icon = config.icon;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`size-5 ${config.color}`} />
                  <h2 className="text-lg font-semibold text-neutral-900">{config.label}</h2>
                  <span className="text-sm text-neutral-500">({categoryTasks.length})</span>
                </div>

                <div className="space-y-2">
                  {categoryTasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + groupIndex * 0.1 + taskIndex * 0.05 }}
                      className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-sm transition-shadow group"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.checked}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          {/* Task Name - Editable */}
                          {editingTask?.taskId === task.id && editingTask?.field === 'name' ? (
                            <input
                              type="text"
                              defaultValue={task.name}
                              autoFocus
                              onBlur={(e) => handleSaveField(task.id, 'name', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveField(task.id, 'name', e.currentTarget.value);
                                if (e.key === 'Escape') setEditingTask(null);
                              }}
                              className="w-full font-medium text-neutral-900 mb-1 px-2 py-1 -mx-2 border border-blue-500 rounded focus:outline-none"
                            />
                          ) : (
                            <h3
                              onClick={() => setEditingTask({ taskId: task.id, field: 'name' })}
                              className="font-medium text-neutral-900 mb-1 cursor-text hover:bg-neutral-50 px-2 py-1 -mx-2 rounded"
                            >
                              {task.name}
                            </h3>
                          )}
                          
                          <p className="text-sm text-neutral-500 mb-2">
                            Extracted from: {task.module}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {/* Time Estimate - Editable */}
                            {editingTask?.taskId === task.id && editingTask?.field === 'time' ? (
                              <input
                                type="text"
                                defaultValue={task.estimatedTime}
                                autoFocus
                                onBlur={(e) => handleSaveField(task.id, 'time', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveField(task.id, 'time', e.currentTarget.value);
                                  if (e.key === 'Escape') setEditingTask(null);
                                }}
                                className="w-20 text-neutral-600 px-2 py-0.5 border border-blue-500 rounded focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => setEditingTask({ taskId: task.id, field: 'time' })}
                                className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 px-2 py-0.5 rounded"
                              >
                                <Clock className="size-4" />
                                <span>{task.estimatedTime}</span>
                              </button>
                            )}
                            <div className="text-neutral-600">Due: {task.suggestedDueDate}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTask({ taskId: task.id, field: 'name' })}
                            className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Pencil className="size-4 text-neutral-500" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                          >
                            <Trash2 className="size-4 text-neutral-400 hover:text-red-600" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}