import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, Search, File, X, Sparkles, 
  User, LayoutDashboard, BookOpen, Users, 
  Calendar, Inbox, Clock, Video, Scale, 
  Heart, HelpCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { AppNav } from "../components/AppNav";
import { Logo } from "../components/Logo";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  availableUntil?: string;
  points?: string;
}

const upcomingAssignments: Assignment[] = [
  {
    id: "upcoming-1",
    title: "Stay Current 7 - 8",
    dueDate: "Due Mar 8 at 11:59pm",
  },
];

const pastAssignments: Assignment[] = [
  {
    id: "2",
    title: "Stay Current 6-7",
    dueDate: "Due Mar 1 at 11:59pm",
  },
  {
    id: "3",
    title: "Stay Current 5-6",
    dueDate: "Due Feb 22 at 11:59pm",
  },
  {
    id: "4",
    title: "Academic Integrity Assignment (Spring 2026)",
    dueDate: "Available until May 8 at 11:59pm | Due Feb 20 at 10:59pm | 1/1 pts",
  },
  {
    id: "5",
    title: "Week 4 - 5",
    dueDate: "Due Feb 14 at 9pm",
  },
  {
    id: "6",
    title: "Stay Current Week 3-4",
    dueDate: "Due Feb 9 at 11:59pm",
  },
  {
    id: "7",
    title: "Week 2-3 Stay Current",
    dueDate: "Due Jan 30 at 9pm",
  },
  {
    id: "8",
    title: "Week 1-2 Stay Current",
    dueDate: "Due Jan 26 at 11:59pm",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDecomposeModal, setShowDecomposeModal] = useState(false);

  useEffect(() => { document.title = "CalDaily — Focus your coursework"; }, []);

  const handleAssignmentClick = (assignment: Assignment) => {
    // Only "Stay Current 7 - 8" is clickable
    if (assignment.id === "upcoming-1") {
      setSelectedAssignment(assignment);
      setShowDecomposeModal(true);
    }
  };

  const handleDecompose = () => {
    navigate("/decomposition");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <AppNav backTo="/" />
      <div className="flex flex-1">
      {/* Global Canvas Sidebar */}
      <aside className="w-[50px] bg-[#2C3E50] text-white flex flex-col items-center py-4 space-y-4 flex-shrink-0">
        {/* Logo */}
        <div className="w-14 h-14 flex items-center justify-center mb-2">
          <Logo size={56} />
        </div>

        {/* Nav Icons */}
        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <User className="size-5" />
          <span className="leading-tight">Account</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <LayoutDashboard className="size-5" />
          <span className="leading-tight">Dashboard</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 bg-white/10 rounded text-[10px] text-center">
          <BookOpen className="size-5" />
          <span className="leading-tight">Courses</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Users className="size-5" />
          <span className="leading-tight">Groups</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Calendar className="size-5" />
          <span className="leading-tight">Calendar</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Inbox className="size-5" />
          <span className="leading-tight">Inbox</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Clock className="size-5" />
          <span className="leading-tight">History</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Video className="size-5" />
          <span className="leading-tight">My Media</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Scale className="size-5" />
          <span className="leading-tight text-[9px]">Student Rights</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center">
          <Heart className="size-5" />
          <span className="leading-tight text-[9px]">Mental Health</span>
        </button>

        <div className="flex-1" />

        <button className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded text-[10px] text-center relative">
          <HelpCircle className="size-5" />
          <span className="leading-tight">Help</span>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-4">
          <button className="p-2 hover:bg-neutral-100 rounded">
            <Menu className="size-5 text-neutral-600" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-900 font-medium">ENGIN 183D-SEM-001</span>
            <span className="text-neutral-400">›</span>
            <span className="text-neutral-600">Assignments</span>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Course Sidebar */}
          <aside className="w-[200px] bg-white border-r border-neutral-200 pt-4 flex-shrink-0">
            <div className="text-xs text-neutral-500 px-4 mb-3">Spring 2026</div>
            <nav className="space-y-0.5">
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Home
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Announcements
              </a>
              <a
                href="#"
                className="block px-4 py-2.5 text-sm text-neutral-900 font-medium bg-neutral-100 border-l-[3px] border-[#0374B5]"
              >
                Assignments
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Discussions
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center justify-between">
                Grades
                <span className="size-5 flex items-center justify-center bg-[#0374B5] text-white text-[10px] rounded-full font-medium">
                  2
                </span>
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                People
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Files
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Syllabus
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Collaborations
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Chat
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Media Gallery
              </a>
              <a href="#" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                Academic Integrity
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-[#F5F5F5] p-6 overflow-y-auto">
            {/* Search and Filter Bar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#00AC18] text-white text-xs font-semibold rounded hover:bg-[#009915]">
                  SHOW BY DATE
                </button>
                <button className="px-4 py-2 border border-neutral-300 bg-white text-neutral-700 text-xs font-semibold rounded hover:bg-neutral-50">
                  SHOW BY TYPE
                </button>
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="mb-6">
              <button className="mb-3 flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
                <span className="text-sm">▸</span>
                <h2 className="text-base font-semibold">Upcoming Assignments</h2>
              </button>

              <div className="bg-white border border-neutral-200 rounded">
                {upcomingAssignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => handleAssignmentClick(assignment)}
                    className="w-full text-left p-4 hover:bg-neutral-50 transition-colors group border-b border-neutral-200 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <File className="size-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-[#0374B5] hover:underline font-normal">
                          {assignment.title}
                        </h3>
                        <div className="text-xs text-neutral-600 mt-1">
                          {assignment.dueDate}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Past Assignments */}
            <div>
              <button className="mb-3 flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
                <span className="text-sm">▸</span>
                <h2 className="text-base font-semibold">Past Assignments</h2>
              </button>

              <div className="bg-white border border-neutral-200 rounded">
                {pastAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="w-full text-left p-4 border-b border-neutral-200 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <File className="size-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-neutral-700 font-normal">
                          {assignment.title}
                        </h3>
                        <div className="text-xs text-neutral-600 mt-1">
                          {assignment.dueDate}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Decompose Modal (Chrome Extension Style) */}
      <AnimatePresence>
        {showDecomposeModal && selectedAssignment && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDecomposeModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                  <button
                    onClick={() => setShowDecomposeModal(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded"
                  >
                    <X className="size-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">CalDaily</h2>
                      <p className="text-sm text-blue-100">AI-Powered Task Breakdown</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-xs text-neutral-500 mb-1">Selected Assignment</div>
                    <h3 className="font-semibold text-neutral-900">{selectedAssignment.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">{selectedAssignment.dueDate}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      <strong>✨ What happens next:</strong> We'll break this assignment into bite-sized, execution-ready
                      tasks with time estimates. You'll review everything before it's added to your workspace.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleDecompose}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
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

                  <p className="text-xs text-neutral-500 text-center mt-4">
                    You'll review and approve all tasks before they're added to your calendar.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}