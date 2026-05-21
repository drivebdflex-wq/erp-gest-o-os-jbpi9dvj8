import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Wrench, Package, HardHat, Settings, ChevronRight } from 'lucide-react'

const navItems = [
  {
    title: 'Manutenção',
    icon: Wrench,
    items: [
      { title: 'Dashboard', url: '/dashboard' },
      { title: 'Contratos', url: '/contratos/painel' },
      { title: 'Ordens de Serviço', url: '/ordens' },
      { title: 'Medições', url: '/medicoes' },
      { title: 'Agenda Técnica', url: '/operacional/agenda' },
      { title: 'Equipes', url: '/operacional/equipes' },
      { title: 'Relatórios', url: '/relatorios' },
    ],
  },
  {
    title: 'Estoque',
    icon: Package,
    items: [
      { title: 'Dashboard', url: '/estoque/dashboard' },
      { title: 'Produtos', url: '/estoque/produtos' },
      { title: 'Almoxarifado Central', url: '/estoque/almoxarifado' },
      { title: 'Estoque por Veículo', url: '/estoque/veiculos' },
      { title: 'Movimentações', url: '/estoque/movimentacoes' },
      { title: 'Transferências', url: '/estoque/transferencias' },
      { title: 'Entradas', url: '/estoque/entradas' },
      { title: 'Saídas', url: '/estoque/saidas' },
      { title: 'Inventário', url: '/estoque/inventario' },
      { title: 'Fornecedores', url: '/estoque/fornecedores' },
      { title: 'Compras', url: '/estoque/compras' },
    ],
  },
  {
    title: 'Obras',
    icon: HardHat,
    items: [
      { title: 'Dashboard', url: '/obras/dashboard' },
      { title: 'Projetos', url: '/obras/projetos' },
    ],
  },
  {
    title: 'Configurações',
    icon: Settings,
    items: [
      { title: 'Empresas', url: '/configs/empresas' },
      { title: 'Clientes', url: '/configs/clientes' },
      { title: 'Unidades', url: '/configs/unidades' },
      { title: 'Usuários', url: '/configs/usuarios' },
      { title: 'Técnicos', url: '/configs/tecnicos' },
      { title: 'Equipes', url: '/configs/equipes' },
      { title: 'Perfis e Permissões', url: '/configs/perfis' },
      { title: 'SLA', url: '/configs/sla' },
      { title: 'Categorias de Serviço', url: '/configs/categorias' },
      { title: 'Tipos de Atendimento', url: '/configs/master' },
      { title: 'Checklist', url: '/configs/checklists' },
      { title: 'Integrações', url: '/configs/integracoes' },
      { title: 'Parâmetros do Sistema', url: '/configs/painel' },
    ],
  },
]

export default function Layout() {
  const location = useLocation()
  const [openModule, setOpenModule] = useState<string | null>(null)

  useEffect(() => {
    const currentPath = location.pathname
    const activeModule = navItems.find((module) =>
      module.items.some((item) => {
        if (item.url === '/dashboard' && currentPath === '/dashboard') return true
        if (
          item.url === '/ordens' &&
          (currentPath.startsWith('/ordens') ||
            currentPath.startsWith('/orders') ||
            currentPath.startsWith('/service-orders'))
        )
          return true
        if (item.url !== '/dashboard' && item.url !== '/ordens' && currentPath.startsWith(item.url))
          return true
        return false
      }),
    )
    if (activeModule && activeModule.title !== openModule) {
      setOpenModule(activeModule.title)
    }
  }, [location.pathname])

  const isSubItemActive = (url: string) => {
    const currentPath = location.pathname
    if (url === '/dashboard') return currentPath === '/dashboard'
    if (url === '/ordens')
      return (
        currentPath.startsWith('/ordens') ||
        currentPath.startsWith('/orders') ||
        currentPath.startsWith('/service-orders')
      )
    if (url === '/configs/painel')
      return currentPath === '/configs/painel' || currentPath === '/configs'
    return currentPath.startsWith(url)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <span className="text-xl font-bold">Gestão OS</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((module) => {
                  const isActiveModule = module.items.some((item) => isSubItemActive(item.url))
                  return (
                    <Collapsible
                      key={module.title}
                      asChild
                      open={openModule === module.title}
                      onOpenChange={(isOpen) => setOpenModule(isOpen ? module.title : null)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={module.title}
                            isActive={isActiveModule}
                            className="font-medium"
                          >
                            {module.icon && <module.icon />}
                            <span>{module.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <SidebarMenuSub>
                            {module.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubItemActive(subItem.url)}
                                >
                                  <Link to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
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
