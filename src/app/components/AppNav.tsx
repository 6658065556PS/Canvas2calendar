import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { Calendar } from "lucide-react";
import { NavButtons } from "./NavButtons";
import { useAuth } from "../context/AuthContext";

interface AppNavProps {
  /** Explicit back destination. Falls back to browser history if omitted. */
  backTo?: string;
  /** Extra buttons rendered to the left of the avatar (e.g. Sync, Settings). */
  rightContent?: ReactNode;
}

const NAV_LINKS = [
  { label: "Assignments", path: "/landing" },
  { label: "My Tasks",    path: "/decomposition" },
  { label: "Calendar",    path: "/calendar" },
] as const;

export function AppNav({ backTo, rightContent }: AppNavProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials  = (user?.user_metadata?.full_name as string | undefined)
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Left: back/forward + logo + nav links */}
        <div className="flex items-center gap-1 min-w-0">
          <NavButtons backTo={backTo} />

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 ml-1 mr-3"
            aria-label="Home"
          >
            <div className="size-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="size-5 text-white" />
            </div>
            <span className="text-base font-semibold text-neutral-900 hidden sm:block whitespace-nowrap">
              Canvas2Calendar
            </span>
          </button>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-neutral-200 mr-2" />

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: page-specific buttons + avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightContent}

          {user ? (
            <button
              onClick={() => navigate("/settings")}
              className="flex-shrink-0 ml-1"
              title="Account settings"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="size-8 rounded-full border-2 border-neutral-200 hover:border-neutral-400 transition-colors object-cover"
                />
              ) : (
                <div className="size-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold hover:bg-neutral-700 transition-colors">
                  {initials}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-1.5 rounded-md hover:bg-neutral-50"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
