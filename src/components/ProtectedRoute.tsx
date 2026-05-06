import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore, { Permission } from '@/stores/useAuthStore'
import { toast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export default function ProtectedRoute({
  requiredPermission,
}: {
  requiredPermission?: Permission
}) {
  const { isAuthenticated, isLoading, hasPermission } = useAuthStore()

  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredPermission && !hasPermission(requiredPermission)) {
      toast({
        title: 'Acesso Restrito',
        description: 'Você não tem permissão para acessar esta área.',
        variant: 'destructive',
      })
    }
  }, [isAuthenticated, isLoading, requiredPermission, hasPermission])

  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
