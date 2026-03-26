import {
  LayoutDashboard,
  ClipboardList,
  Map as MapIcon,
  UserCheck,
  Truck,
  DollarSign,
  Settings,
  Handshake,
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Ordens de Serviço', url: '/ordens', icon: ClipboardList },
  {
    title: 'Contratos',
    icon: Handshake,
    subItems: [
      { title: 'Manutenção', url: '/contratos/manutencao' },
      { title: 'Obras', url: '/contratos/obras' },
    ],
  },
  { title: 'Mapa e Rotas', url: '/mapa', icon: MapIcon },
  { title: 'Auditoria', url: '/auditoria', icon: UserCheck },
  {
    title: 'Financeiro',
    icon: DollarSign,
    subItems: [
      { title: 'Dashboard', url: '/financeiro/dashboard' },
      { title: 'Receitas', url: '/financeiro/receitas' },
      { title: 'Compras', url: '/financeiro/compras' },
      { title: 'Custos', url: '/financeiro/custos' },
      { title: 'Estoque', url: '/financeiro/estoque' },
    ],
  },
  { title: 'Veículos', url: '/veiculos', icon: Truck },
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
              {navItems.map((item) =>
                item.subItems ? (
                  <Collapsible key={item.title} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === sub.url}
                              >
                                <Link to={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link to={item.url!} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
