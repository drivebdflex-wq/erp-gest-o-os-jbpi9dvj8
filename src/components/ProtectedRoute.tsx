import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore, { Permission } from '@/stores/useAuthStore'
import { toast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export default function ProtectedRoute({
  requiredPermission,
}: {
  requiredPermission?: Permission
}) {
  const { isAuthenticated, hasPermission } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && requiredPermission && !hasPermission(requiredPermission)) {
      toast({
        title: 'Acesso Restrito',
        description: 'Você não tem permissão para acessar esta área.',
        variant: 'destructive',
      })
    }
  }, [isAuthenticated, requiredPermission, hasPermission])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
