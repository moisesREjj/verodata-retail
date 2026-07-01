import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />
  }

  if (role && user.rol !== role) {
    return <Navigate to={user.rol === 'ROLE_ADMIN' ? '/dashboard' : '/'} replace />
  }

  return children
}
