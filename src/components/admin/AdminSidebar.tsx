import {
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  UserCheck,
  Package,
  Truck,
  DollarSign,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Ordens de Serviço', url: '/ordens', icon: ClipboardList },
  { title: 'Mapa e Rotas', url: '/mapa', icon: MapIcon },
  { title: 'Auditoria', url: '/auditoria', icon: UserCheck },
  { title: 'Estoque', url: '/estoque', icon: Package },
  { title: 'Veículos', url: '/veiculos', icon: Truck },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Configurações', url: '/configs', icon: Settings },
]

export default function AdminSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" className="border-r shadow-sm">
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClipboardList className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            FieldOps <span className="text-primary">Pro</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
