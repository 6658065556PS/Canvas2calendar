import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, ListChecks, CalendarDays, Settings, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

const BERKELEY_BLUE = "#003262";
const CAL_GOLD = "#FDB515";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard",     Icon: LayoutDashboard },
  { label: "Tasks",     path: "/decomposition", Icon: ListChecks },
  { label: "Calendar",  path: "/calendar",      Icon: CalendarDays },
  { label: "Settings",  path: "/settings",      Icon: Settings },
] as const;

export function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const [expanded, setExpanded] = useState(true);

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials  = (user?.user_metadata?.full_name as string | undefined)
    ?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    ?? user?.email?.[0]?.toUpperCase() ?? "?";

  if (!expanded) {
    // Collapsed — thin top bar
    return (
      <header
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 z-50 shadow-md"
        style={{ backgroundColor: BERKELEY_BLUE }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-left"
          >
            <span className="text-white font-bold text-[17px]" style={{ fontFamily: "var(--font-serif)" }}>
              CalDaily
            </span>
            <span className="block text-white/60 text-xs">UC Berkeley</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[220px] z-40"
        style={{ backgroundColor: BERKELEY_BLUE }}
      >
        {/* Logo + collapse */}
        <div className="flex items-start justify-between px-5 py-6 border-b border-white/10">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 text-left">
            <Logo size={84} />
            <div>
              <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                CalDaily
              </span>
              <span className="block text-white/60 text-xs mt-0.5">UC Berkeley</span>
            </div>
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: active ? CAL_GOLD : "transparent",
                  color: active ? BERKELEY_BLUE : "rgba(255,255,255,0.9)",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <Icon className="size-[18px] shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Avatar / profile */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="size-8 rounded-full border-2 object-cover border-white/20" />
            ) : (
              <div
                className="size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: CAL_GOLD, color: BERKELEY_BLUE }}
              >
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {(user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "Account"}
              </p>
              <p className="text-white/40 text-xs truncate">{user?.email ?? ""}</p>
            </div>
          </button>
          <p className="text-white/30 text-xs mt-4">© 2026 CalDaily</p>
          <p className="text-white/30 text-xs">Built for Cal students</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{ backgroundColor: BERKELEY_BLUE, borderColor: "rgba(255,255,255,0.1)" }}
      >
        {NAV_ITEMS.map(({ label, path, Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
              style={{ color: active ? CAL_GOLD : "rgba(255,255,255,0.5)" }}
            >
              <Icon className="size-5" />
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

/** Wrap authenticated pages with this — adds the sidebar + correct offset */
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Sidebar />
      {/* Desktop: offset for 220px sidebar. Mobile: bottom padding for nav bar */}
      <div className="md:ml-[220px] pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
