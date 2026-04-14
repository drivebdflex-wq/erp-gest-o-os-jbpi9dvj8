import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { SidebarProvider } from '@/components/ui/sidebar'
import AdminSidebar from './admin/AdminSidebar'
import Header from './Header'
import TechBottomNav from './tech/TechBottomNav'

export default function Layout() {
  const { currentUser } = useAuthStore()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Se for especificamente do papel "Técnico", injeta o layout mobile amigável
  if (currentUser.role_id === 'role-tecnico') {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-0 sm:p-4 animate-fade-in">
        <div className="tech-mobile-container">
          <Header />
          <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
            <Outlet />
          </main>
          <TechBottomNav />
        </div>
      </div>
    )
  }

  // Layout Administrativo / Padrão
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background animate-fade-in">
        <AdminSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-secondary/20">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
