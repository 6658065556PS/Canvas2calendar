import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, profile, profileLoading } = useAuth()
  const location = useLocation()

  // Demo mode: bypass auth entirely — pages handle null user via localStorage/mock data
  const isDemo = sessionStorage.getItem('caldaily_demo') === 'true'
  if (isDemo) return <>{children}</>

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <Loader2 className="size-5 text-neutral-400 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
