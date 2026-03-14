import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { Calendar, Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 bg-neutral-900 rounded-xl flex items-center justify-center">
            <Calendar className="size-6 text-white" />
          </div>
          <Loader2 className="size-5 text-neutral-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    // Save where the user was trying to go so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
