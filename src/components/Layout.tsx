import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Ruler,
  Calendar,
  Users,
  Package,
  BarChart,
} from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <span className="text-xl font-bold">Gestão OS</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manutenção</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
                      <Link to="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith('/contratos')}
                    >
                      <Link to="/contratos/painel">
                        <FileText className="h-4 w-4" />
                        <span>Contratos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname.startsWith('/ordens') ||
                        location.pathname.startsWith('/orders') ||
                        location.pathname.startsWith('/service-orders')
                      }
                    >
                      <Link to="/ordens">
                        <ClipboardList className="h-4 w-4" />
                        <span>Ordens de Serviço</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/medicoes')}>
                      <Link to="/medicoes">
                        <Ruler className="h-4 w-4" />
                        <span>Medições</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/operacional/agenda'}
                    >
                      <Link to="/operacional/agenda">
                        <Calendar className="h-4 w-4" />
                        <span>Agenda Técnica</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/operacional/equipes'}
                    >
                      <Link to="/operacional/equipes">
                        <Users className="h-4 w-4" />
                        <span>Equipes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname.startsWith('/estoque')}>
                      <Link to="/estoque/dashboard">
                        <Package className="h-4 w-4" />
                        <span>Estoque</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith('/relatorios')}
                    >
                      <Link to="/relatorios">
                        <BarChart className="h-4 w-4" />
                        <span>Relatórios</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          <header className="h-16 border-b flex items-center px-4 shrink-0 bg-background z-10 sticky top-0 w-full">
            <SidebarTrigger className="-ml-1 mr-4" />
            <h1 className="text-xl font-semibold">ERP Gestão OS</h1>
          </header>
          <div className="flex-1 overflow-auto bg-muted/30">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
