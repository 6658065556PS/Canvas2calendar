import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Check,
  RefreshCw,
  Settings as SettingsIcon,
  ExternalLink,
  LogOut,
  CalendarCheck,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { SidebarLayout } from "../components/Sidebar";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../../lib/database";
import type { Profile } from "../../lib/types";

export function Settings() {
  const navigate = useNavigate();
  const { user, session, providerToken, gcalTokenExpired, signOut, connectGoogleCalendar } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Canvas token state
  const [canvasToken, setCanvasToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [tokenMsg, setTokenMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Local copies of toggle states
  const [autoSync, setAutoSync] = useState(true);
  const [breakDown, setBreakDown] = useState(true);
  const [syncAnnouncements, setSyncAnnouncements] = useState(false);
  const [timeEst, setTimeEst] = useState<'conservative' | 'moderate' | 'aggressive'>("moderate");
  const [workload, setWorkload] = useState<'balanced' | 'front-loaded' | 'back-loaded'>("balanced");
  const [weekStart, setWeekStartDay] = useState<'sunday' | 'monday'>("sunday");

  useEffect(() => { document.title = "Settings — CalBuddy"; }, []);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => {
      if (!p) return;
      setProfile(p);
      if (p.canvas_api_token) setCanvasToken(p.canvas_api_token);
      const s = (p.settings ?? {}) as Profile['settings'];
      setAutoSync(s.autoSync ?? true);
      setBreakDown(s.breakDownAssignments ?? true);
      setSyncAnnouncements(s.syncAnnouncements ?? false);
      setTimeEst(s.timeEstimation ?? "moderate");
      setWorkload(s.workloadPreference ?? "balanced");
      setWeekStartDay(s.weekStartDay ?? "sunday");
    });
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      settings: {
        autoSync,
        breakDownAssignments: breakDown,
        syncAnnouncements,
        timeEstimation: timeEst,
        workloadPreference: workload,
        weekStartDay: weekStart,
      },
    });
    setSaving(false);
    setSaveMsg(error ? `Error: ${error}` : "Preferences saved.");
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleSaveCanvasToken = async () => {
    if (!user) return;
    setSavingToken(true);
    const { error } = await updateProfile(user.id, { canvas_api_token: canvasToken.trim() || null });
    setSavingToken(false);
    setTokenMsg(error ? `Error: ${error}` : "Token saved.");
    setTimeout(() => setTokenMsg(null), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSyncNow = async () => {
    if (!user || !profile?.canvas_api_token) return;
    setSyncing(true);
    setTokenMsg(null);
    try {
      const res = await fetch("/api/canvas/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Sync failed (${res.status})`);
      setTokenMsg("Sync started — assignments will appear shortly.");
    } catch (err) {
      setTokenMsg(err instanceof Error ? `Error: ${err.message}` : "Sync failed.");
    } finally {
      setSyncing(false);
      setTimeout(() => setTokenMsg(null), 4000);
    }
  };

  const gcalConnected = !!providerToken;

  return (
    <SidebarLayout>
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="size-8 text-neutral-700" />
            <h1 className="text-4xl font-semibold text-neutral-900">Settings</h1>
          </div>
          <p className="text-lg text-neutral-600">Manage your account, integrations, and preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* ── Account ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Account</h2>
            <div className="flex items-center gap-4 mb-6">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="size-14 rounded-full border border-neutral-200"
                />
              ) : (
                <div className="size-14 rounded-full bg-neutral-200 flex items-center justify-center">
                  <User className="size-7 text-neutral-500" />
                </div>
              )}
              <div>
                <div className="font-semibold text-neutral-900">
                  {user?.user_metadata?.full_name ?? "—"}
                </div>
                <div className="text-sm text-neutral-500">{user?.email ?? "—"}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Signed in with {user?.app_metadata?.provider === 'google' ? 'Google' : 'email'}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>

          {/* ── Google Calendar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Google Calendar</h2>
              <p className="text-sm text-neutral-600 mb-6">
                Push your scheduled tasks directly to your Google Calendar.
              </p>

              {gcalConnected ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="size-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-green-900 mb-1">Google Calendar Connected</div>
                      <div className="text-sm text-green-700">
                        Access granted via your Google account. Use the "Sync to Google Calendar"
                        button on the Calendar page to push this week's tasks.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-900 mb-1">
                        {gcalTokenExpired ? "Google Calendar access expired" : "Google Calendar not connected"}
                      </div>
                      <div className="text-sm text-amber-700 mb-3">
                        {gcalTokenExpired
                          ? "Your access token expired (valid ~1 hour). Sign in again to restore calendar sync."
                          : "Sign in again to grant Google Calendar permission."}
                      </div>
                      <Button
                        onClick={connectGoogleCalendar}
                        size="sm"
                        className="bg-neutral-900 hover:bg-neutral-800 text-white"
                      >
                        <CalendarCheck className="size-4 mr-2" />
                        Connect Google Calendar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-neutral-300"
                  onClick={() => navigate("/calendar")}
                >
                  <CalendarCheck className="size-4 mr-2" />
                  Go to Calendar to Sync
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── Canvas Integration ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">Canvas Integration</h2>
              <p className="text-sm text-neutral-600 mb-6">
                Enter your Canvas personal access token to enable coursework sync.{" "}
                <a
                  href="https://bcourses.berkeley.edu/profile/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get your token ↗
                </a>{" "}
                (bCourses → Account → Settings → New Access Token)
              </p>

              {profile?.canvas_api_token ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="size-5 text-white" />
                    </div>
                    <div className="font-medium text-green-900">Canvas token saved</div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">No token saved — sync will fail until you add one.</div>
                </div>
              )}

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type={showToken ? "text" : "password"}
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    placeholder="Paste your Canvas access token"
                    className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleSaveCanvasToken}
                  disabled={savingToken || !canvasToken.trim()}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  {savingToken ? "Saving…" : "Save"}
                </Button>
              </div>
              {tokenMsg && (
                <p className={`text-sm mb-3 ${tokenMsg.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
                  {tokenMsg}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-neutral-300"
                  onClick={handleSyncNow}
                  disabled={!profile?.canvas_api_token || syncing}
                >
                  <RefreshCw className={`size-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing…" : "Sync Coursework Now"}
                </Button>
                {profile?.canvas_api_token && (
                  <Button
                    variant="outline"
                    className="border-neutral-300 text-red-600 hover:text-red-700"
                    onClick={async () => {
                      setSavingToken(true);
                      const { error } = await updateProfile(user!.id, { canvas_api_token: null });
                      setSavingToken(false);
                      if (!error) {
                        setCanvasToken("");
                        setProfile((p) => p ? { ...p, canvas_api_token: null } : p);
                      }
                      setTokenMsg(error ? `Error: ${error}` : "Canvas disconnected.");
                      setTimeout(() => setTokenMsg(null), 3000);
                    }}
                  >
                    Disconnect Canvas
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="p-6">
              <h3 className="font-medium text-neutral-900 mb-3">Sync Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="size-4 rounded border-neutral-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Auto-sync daily</div>
                    <div className="text-xs text-neutral-500">Automatically check for new assignments at 6:00 AM</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breakDown}
                    onChange={(e) => setBreakDown(e.target.checked)}
                    className="size-4 rounded border-neutral-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Break down assignments</div>
                    <div className="text-xs text-neutral-500">Automatically decompose large assignments into smaller tasks</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncAnnouncements}
                    onChange={(e) => setSyncAnnouncements(e.target.checked)}
                    className="size-4 rounded border-neutral-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-neutral-900">Sync course announcements</div>
                    <div className="text-xs text-neutral-500">Include course announcements in your feed</div>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* ── Task Preferences ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">Task Preferences</h2>
            <p className="text-sm text-neutral-600 mb-6">Customize how tasks are organized and displayed.</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Default time estimation
                </label>
                <select
                  value={timeEst}
                  onChange={(e) => setTimeEst(e.target.value as 'conservative' | 'moderate' | 'aggressive')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                >
                  <option value="conservative">Conservative (add 25% buffer)</option>
                  <option value="moderate">Moderate (no adjustment)</option>
                  <option value="aggressive">Aggressive (reduce by 15%)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">Workload preference</label>
                <select
                  value={workload}
                  onChange={(e) => setWorkload(e.target.value as 'balanced' | 'front-loaded' | 'back-loaded')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                >
                  <option value="balanced">Balanced (spread evenly)</option>
                  <option value="front-loaded">Front-loaded (earlier in week)</option>
                  <option value="back-loaded">Back-loaded (later in week)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">Week start day</label>
                <select
                  value={weekStart}
                  onChange={(e) => setWeekStartDay(e.target.value as 'sunday' | 'monday')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                >
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  {saving ? "Saving…" : "Save Preferences"}
                </Button>
                {saveMsg && (
                  <span className={`text-sm ${saveMsg.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6"
          >
            <Button variant="ghost" className="text-neutral-500 hover:text-neutral-700">
              <ExternalLink className="size-4 mr-2" />
              Privacy Policy
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
}
