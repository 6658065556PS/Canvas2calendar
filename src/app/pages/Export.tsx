import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CalendarCheck, FileText, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { SidebarLayout } from "../components/Sidebar";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

const EXPORT_OPTIONS = [
  {
    id: "google",
    icon: CalendarCheck,
    label: "Export to Google Calendar",
    description: "Add all your tasks as calendar events with due dates and reminders.",
    color: "#4285F4",
    bg: "#EBF3FE",
    border: "#BFDBFE",
    cta: "Connect Google Calendar",
  },
  {
    id: "notion",
    icon: FileText,
    label: "Export to Notion",
    description: "Push your task list into a Notion database — ready to manage in your workspace.",
    color: "#000000",
    bg: "#F5F5F5",
    border: "#D4D4D4",
    cta: "Connect Notion",
  },
  {
    id: "claude",
    icon: Sparkles,
    label: "Export to Claude",
    description: "Let Claude handle scheduling — paste your task list and get a full weekly plan in seconds.",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FCD34D",
    cta: "Open in Claude",
    recommended: true,
  },
];

function ExportCard({ option, index }: { option: typeof EXPORT_OPTIONS[0]; index: number }) {
  const Icon = option.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-2xl border-2 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow relative"
      style={{ borderColor: option.border }}
    >
      {option.recommended && (
        <div
          className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: "#D97706" }}
        >
          Recommended workaround
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: option.bg }}>
          <Icon className="size-6" style={{ color: option.color }} />
        </div>
        <h3 className="text-base font-bold text-neutral-900">{option.label}</h3>
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{option.description}</p>
      <Button
        className="w-full mt-auto font-semibold flex items-center justify-center gap-2"
        style={{ backgroundColor: option.color === "#000000" ? "#1a1a1a" : option.color, color: "white" }}
      >
        {option.cta}
        <ArrowRight className="size-4" />
      </Button>
    </motion.div>
  );
}

export function Export() {
  const navigate = useNavigate();
  useEffect(() => { document.title = "Export — CalDaily"; }, []);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* Header */}
        <div className="px-8 pt-10 pb-8" style={{ backgroundColor: BERKELEY_BLUE }}>
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                Export Your Tasks
              </h1>
              <p className="text-white/70 text-base">
                Send your decomposed task list to the tools you already use.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 p-6 flex items-center justify-between gap-4"
            style={{ borderColor: CAL_GOLD }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="size-2 rounded-full" style={{ backgroundColor: CAL_GOLD }} />
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Primary action</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Add tasks to my workspace</h2>
              <p className="text-sm text-neutral-500 mt-1">Save all tasks to your CalDaily task list and drag them onto the calendar.</p>
            </div>
            <Button
              onClick={() => navigate("/calendar")}
              className="shrink-0 font-bold px-6 py-3 text-base"
              style={{ backgroundColor: BERKELEY_BLUE, color: "white" }}
            >
              Go to Calendar
            </Button>
          </motion.div>

          {/* What's ready */}
          <div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">What you're exporting</p>
            <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
              {[
                "Product Launch Story — due Apr 19",
                "Final Pitch Presentation + Tech Review — due Apr 28",
                "Stay Current 12 - 13 — due Apr 19",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 px-5 py-3">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <span className="text-sm text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export options */}
          <div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Export to another tool</p>
            <div className="grid gap-4">
              {EXPORT_OPTIONS.map((opt, i) => (
                <ExportCard key={opt.id} option={opt} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
