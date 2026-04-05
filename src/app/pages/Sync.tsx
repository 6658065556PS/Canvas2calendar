import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, CalendarCheck, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../../lib/database";

type SyncMethod = "ical" | "apikey";
type SyncStatus = "idle" | "syncing" | "done" | "gcal" | "error";

// Canvas/bCourses stylized "C" logo
function CanvasLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Canvas"
    >
      <circle cx="50" cy="50" r="48" fill="#E66000" />
      <path
        d="M68 33c-4.5-4.2-10.6-6.8-17.3-6.8C36.8 26.2 26 37.1 26 50.4s10.8 24.2 24.7 24.2c6.5 0 12.4-2.5 16.8-6.5l-5.8-7.4c-2.9 2.7-6.8 4.4-11 4.4-9 0-16.3-7.1-16.3-15.8S41.7 34 50.7 34c4 0 7.7 1.5 10.5 3.9L68 33z"
        fill="white"
      />
    </svg>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="shrink-0 size-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold leading-none">
        {n}
      </span>
      <span className="text-neutral-700 text-[15px] mt-1">{children}</span>
    </li>
  );
}

export function Sync() {
  const navigate = useNavigate();
  const { user, connectGoogleCalendar } = useAuth();
  const [method, setMethod] = useState<SyncMethod>("apikey");
  const [feedUrl, setFeedUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => { document.title = "Connect Canvas — CalBuddy"; }, []);

  async function handleIcalConnect() {
    if (!feedUrl.trim()) return;
    setStatus("syncing");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/canvas/ical-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, feedUrl: feedUrl.trim() }),
      });

      if (res.status === 404) {
        throw new Error("Sync API not reachable. Use `vercel dev` instead of `npm run dev` to test this locally.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `Sync failed (${res.status})`);
      }

      setStatus("done");
      setTimeout(() => setStatus("gcal"), 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  async function handleApiKeyConnect() {
    if (!apiKey.trim() || !user) return;
    setStatus("syncing");
    setErrorMessage(null);

    try {
      // Save token to profile first
      const { error: saveErr } = await updateProfile(user.id, { canvas_api_token: apiKey.trim() });
      if (saveErr) throw new Error("Failed to save API token");

      // Trigger QStash sync
      const res = await fetch("/api/canvas/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.status === 404) {
        throw new Error("Sync API not reachable. Use `vercel dev` instead of `npm run dev` to test this locally.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `Sync failed (${res.status})`);
      }

      setStatus("done");
      setTimeout(() => setStatus("gcal"), 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  // ── Loading / result states ──────────────────────────────────────────────

  if (status === "syncing") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6 size-10 border-[3px] border-neutral-900 border-t-transparent rounded-full"
          />
          <h2 className="text-xl font-semibold text-neutral-900 mb-1.5">Syncing your courses…</h2>
          <p className="text-neutral-500 text-sm">Fetching assignments and enriching with AI</p>
        </motion.div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 size-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="size-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-1.5">Connected!</h2>
          <p className="text-neutral-500 text-sm">Taking you to your assignments…</p>
        </motion.div>
      </div>
    );
  }

  if (status === "gcal") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] text-center"
        >
          <div className="mx-auto mb-5 size-14 bg-[#003262] rounded-full flex items-center justify-center">
            <CalendarCheck className="size-7 text-[#FDB515]" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Connect Google Calendar</h2>
          <p className="text-neutral-500 text-sm mb-2">
            Sync your tasks to Google Calendar so they show up alongside your classes and events.
          </p>
          <p className="text-xs text-neutral-400 mb-8">Optional — you can connect this later in Settings.</p>
          <button
            onClick={() => navigate("/decomposition")}
            className="w-full py-[14px] bg-[#003262] text-white rounded-2xl text-sm font-semibold hover:bg-[#002347] transition-colors mb-3 flex items-center justify-center gap-2"
          >
            Continue to Dashboard <ChevronRight className="size-4" />
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem("calbuddy_next", "/decomposition");
              connectGoogleCalendar();
            }}
            className="w-full py-[14px] border border-neutral-300 text-neutral-700 rounded-2xl text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
          >
            <CalendarCheck className="size-4" />
            Also connect Google Calendar
          </button>
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="mx-auto mb-5 size-12 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="size-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Connection failed</h2>
          <p className="text-neutral-500 text-sm mb-6">{errorMessage}</p>
          <button
            onClick={() => setStatus("idle")}
            className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Try again
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Idle — show connect form ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {method === "apikey" ? (
          <motion.div
            key="apikey"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <CanvasLogo size={34} />
              <span className="text-[22px] font-semibold text-neutral-900 tracking-tight">bCourses</span>
            </div>

            {/* Steps */}
            <ol className="space-y-5 mb-8">
              <Step n={1}>
                go to{" "}
                <a
                  href="https://bcourses.berkeley.edu/profile/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Account → Settings
                </a>
              </Step>
              <Step n={2}>scroll to "Approved Integrations" and click "+ New Access Token"</Step>
              <Step n={3}>copy the token and paste it below</Step>
            </ol>

            {/* Input */}
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApiKeyConnect()}
              placeholder="paste API token"
              className="w-full px-5 py-[14px] rounded-2xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-2 focus:ring-neutral-900 mb-3"
            />

            {/* Connect button */}
            <button
              onClick={handleApiKeyConnect}
              disabled={!apiKey.trim()}
              className="w-full py-[14px] bg-neutral-900 text-white rounded-2xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-5"
            >
              connect
            </button>

            {/* Fallback link */}
            <p className="text-center text-sm text-neutral-400">
              <button
                onClick={() => setMethod("ical")}
                className="hover:text-neutral-600 transition-colors"
              >
                use calendar feed instead (no token required)
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="ical"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <CanvasLogo size={34} />
              <span className="text-[22px] font-semibold text-neutral-900 tracking-tight">bCourses</span>
            </div>

            {/* Steps */}
            <ol className="space-y-5 mb-8">
              <Step n={1}>
                go to your{" "}
                <a
                  href="https://bcourses.berkeley.edu/calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bCourses calendar
                </a>
              </Step>
              <Step n={2}>click "Calendar Feed" at the bottom right</Step>
              <Step n={3}>copy the feed URL and paste it below</Step>
            </ol>

            {/* Input */}
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleIcalConnect()}
              placeholder="paste calendar feed URL"
              className="w-full px-5 py-[14px] rounded-2xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm outline-none focus:ring-2 focus:ring-neutral-900 mb-3"
            />

            {/* Connect button */}
            <button
              onClick={handleIcalConnect}
              disabled={!feedUrl.trim()}
              className="w-full py-[14px] bg-neutral-900 text-white rounded-2xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-5"
            >
              connect
            </button>

            {/* Back link */}
            <p className="text-center text-sm text-neutral-400">
              <button
                onClick={() => setMethod("apikey")}
                className="hover:text-neutral-600 transition-colors"
              >
                use API token instead (recommended — full data access)
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
