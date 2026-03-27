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
  Box,
  Users,
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
import useAuthStore, { Permission } from '@/stores/useAuthStore'

type NavItem = {
  title: string
  url?: string
  icon: any
  permission?: Permission
  subItems?: { title: string; url: string }[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
  { title: 'Ordens de Serviço', url: '/ordens', icon: ClipboardList, permission: 'view_dashboard' },
  {
    title: 'Operacional',
    icon: Users,
    permission: 'view_operational',
    subItems: [
      { title: 'Dashboard Operacional', url: '/operacional/dashboard' },
      { title: 'Painel do Supervisor', url: '/operacional/painel' },
      { title: 'Agenda & Escalas', url: '/operacional/agenda' },
      { title: 'Equipes', url: '/operacional/equipes' },
      { title: 'Técnicos', url: '/operacional/tecnicos' },
      { title: 'Indicadores', url: '/operacional/indicadores' },
      { title: 'Eventos / Disciplina', url: '/operacional/eventos' },
      { title: 'Feedback & PDI', url: '/operacional/feedback' },
      { title: 'Histórico', url: '/operacional/historico' },
    ],
  },
  {
    title: 'Contratos',
    icon: Handshake,
    permission: 'manage_contracts',
    subItems: [
      { title: 'Manutenção', url: '/contratos/manutencao' },
      { title: 'Obras', url: '/contratos/obras' },
    ],
  },
  { title: 'Mapa e Rotas', url: '/mapa', icon: MapIcon, permission: 'view_operational' },
  { title: 'Auditoria', url: '/auditoria', icon: UserCheck, permission: 'edit_service_order' },
  {
    title: 'Estoque',
    icon: Box,
    permission: 'manage_stock',
    subItems: [
      { title: 'Dashboard', url: '/estoque/dashboard' },
      { title: 'Produtos', url: '/estoque/produtos' },
      { title: 'Almoxarifado Central', url: '/estoque/almoxarifado' },
      { title: 'Estoque por Veículo', url: '/estoque/veiculos' },
      { title: 'Movimentações', url: '/estoque/movimentacoes' },
      { title: 'Requisições', url: '/estoque/requisicoes' },
      { title: 'Inventário Físico', url: '/estoque/inventario' },
    ],
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    permission: 'view_financial',
    subItems: [
      { title: 'Dashboard', url: '/financeiro/dashboard' },
      { title: 'Receitas', url: '/financeiro/receitas' },
      { title: 'Compras', url: '/financeiro/compras' },
      { title: 'Custos', url: '/financeiro/custos' },
      { title: 'Estoque e Análise', url: '/financeiro/estoque' },
      { title: 'DRE', url: '/financeiro/dre' },
      { title: 'Fluxo de Caixa', url: '/financeiro/fluxo-caixa' },
      { title: 'Custo de Técnicos', url: '/financeiro/tecnicos' },
    ],
  },
  {
    title: 'Frotas',
    icon: Truck,
    permission: 'manage_fleet',
    subItems: [
      { title: 'Dashboard', url: '/frotas/dashboard' },
      { title: 'Veículos', url: '/veiculos' },
      { title: 'Motoristas', url: '/frotas/motoristas' },
      { title: 'Manutenções', url: '/frotas/manutencoes' },
      { title: 'Abastecimentos', url: '/frotas/abastecimentos' },
      { title: 'Histórico', url: '/frotas/historico' },
    ],
  },
  { title: 'Configurações', url: '/configs', icon: Settings, permission: 'manage_users' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const { hasPermission } = useAuthStore()

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  )

  return (
    <Sidebar variant="sidebar" className="border-r shadow-sm">
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
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
              {filteredNavItems.map((item) =>
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
