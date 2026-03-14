import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Landing } from "./pages/Landing";
import { Sync } from "./pages/Sync";
import { Decomposition } from "./pages/Decomposition";
import { Review } from "./pages/Review";
import { Calendar } from "./pages/Calendar";
import { Settings } from "./pages/Settings";
import { Auth } from "./pages/Auth";
import { AuthCallback } from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  { path: "/",         Component: Home },
  { path: "/landing",  Component: Landing },
  { path: "/sync",     Component: Sync },
  { path: "/decomposition", Component: Decomposition },
  { path: "/review",   Component: Review },
  { path: "/auth",     Component: Auth },
  { path: "/auth/callback", Component: AuthCallback },

  // ── Protected routes (require Google sign-in) ──────────────────────────
  {
    path: "/calendar",
    element: <ProtectedRoute><Calendar /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
]);
