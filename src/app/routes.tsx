import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Landing } from "./pages/Landing";
import { Sync } from "./pages/Sync";
import { Decomposition } from "./pages/Decomposition";
import { Review } from "./pages/Review";
import { Calendar } from "./pages/Calendar";
import { Settings } from "./pages/Settings";
import { Export } from "./pages/Export";
import { Auth } from "./pages/Auth";
import { AuthCallback } from "./pages/AuthCallback";
import { Workspace } from "./pages/Workspace";
import { ComingSoon } from "./pages/ComingSoon";
import { Dashboard } from "./pages/Dashboard";
import { Coursework } from "./pages/Coursework";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  { path: "/",              Component: Home },
  { path: "/landing",       Component: Landing },
  { path: "/auth",          Component: Auth },
  { path: "/auth/callback", Component: AuthCallback },
  { path: "/coming-soon",   Component: ComingSoon },

  // ── Protected routes (require sign-in + completed onboarding) ──────────
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/coursework",
    element: <ProtectedRoute><Coursework /></ProtectedRoute>,
  },
  {
    path: "/courses",
    element: <ProtectedRoute><Coursework /></ProtectedRoute>,
  },
  {
    path: "/sync",
    element: <ProtectedRoute><Sync /></ProtectedRoute>,
  },
  {
    path: "/decomposition",
    element: <ProtectedRoute><Decomposition /></ProtectedRoute>,
  },
  {
    path: "/review",
    element: <ProtectedRoute><Review /></ProtectedRoute>,
  },
  {
    path: "/workspace",
    element: <ProtectedRoute><Workspace /></ProtectedRoute>,
  },
  {
    path: "/calendar",
    element: <ProtectedRoute><Calendar /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: "/export",
    element: <ProtectedRoute><Export /></ProtectedRoute>,
  },
]);
