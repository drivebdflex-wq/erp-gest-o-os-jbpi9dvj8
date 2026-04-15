import DashboardCards from '@/components/admin/DashboardCards'
import DashboardCharts from '@/components/admin/DashboardCharts'
import DashboardFilters from '@/components/admin/DashboardFilters'
import KanbanSummary from '@/components/admin/KanbanSummary'
import OrderTable from '@/components/admin/OrderTable'
import ContractWidgets from '@/components/admin/ContractWidgets'
import TechnicianLeaderboard from '@/components/admin/TechnicianLeaderboard'
import PrintableReport from '@/components/admin/PrintableReport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Download,
  FileText,
  Table as TableIcon,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { exportOrdersToCSV } from '@/lib/export'
import { api } from '@/services/api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const mapStatusToPt = (status: string) => {
  const map: Record<string, string> = {
    draft: 'Pendente',
    pending: 'Pendente',
    scheduled: 'Agendado',
    deslocamento: 'Em Deslocamento',
    in_progress: 'Em Execução',
    paused: 'Pausado',
    in_audit: 'Em Auditoria',
    completed: 'Finalizada',
    rejected: 'Rejeitada',
    cancelled: 'Cancelada',
  }
  return map[status?.toLowerCase()] || status || 'Pendente'
}

const mapPriorityToPt = (priority: string) => {
  const map: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Emergencial (48h)',
  }
  return map[priority?.toLowerCase()] || priority || 'Média'
}

export default function Index() {
  const store = useAppStore() as any
  const orders = store?.filteredOrders || []
  const companyLogo = store?.companyLogo
  const companyName = store?.companyName

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.serviceOrders.list()

      const dataArray = Array.isArray(data) ? data : data.data || []
      const mappedOrders = dataArray.map((o: any) => ({
        id: o.id,
        shortId: o.id?.split('-')[0]?.toUpperCase()?.substring(0, 8) || 'OS-000',
        title: o.description || 'Manutenção',
        client: o.client_id || 'Cliente não informado',
        unit: o.unit_id || 'Unidade não informada',
        serviceType: o.service_type || 'preventiva',
        date: o.scheduled_at || o.created_at || new Date().toISOString(),
        tech: o.technician_id || 'Não Atribuído',
        status: mapStatusToPt(o.status),
        priority: mapPriorityToPt(o.priority),
        updatedAt: o.updated_at || o.created_at || new Date().toISOString(),
        contractName: o.contract_id ? 'Contrato Vinculado' : '',
      }))

      // Properly invoke state updaters avoiding "is not a function" crashes depending on store type
      if (typeof store?.setOrders === 'function') {
        store.setOrders(mappedOrders)
      }
      if (typeof store?.setFilteredOrders === 'function') {
        store.setFilteredOrders(mappedOrders)
      }
      // Fallback if the context specifically exposes setState or if it's a direct Zustand hook reference
      if (typeof store?.setState === 'function') {
        store.setState({ orders: mappedOrders, filteredOrders: mappedOrders })
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar com a API')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleExportCSV = () => exportOrdersToCSV(orders)
  const handleExportPDF = () => window.print()

  const alerts: any[] = []
  const now = new Date().getTime()

  // Guard against undefined to prevent prototype function errors
  if (Array.isArray(orders)) {
    orders.forEach((o) => {
      if (['Finalizada', 'Cancelada', 'Rejeitada'].includes(o.status)) return

      const updatedAt = new Date(o.updatedAt).getTime()
      const hoursSinceUpdate = (now - updatedAt) / (1000 * 60 * 60)

      if (hoursSinceUpdate > 24) {
        alerts.push({
          id: `${o.id}-stuck`,
          type: 'stuck',
          title: `OS ${o.shortId} estagnada`,
          message: `Há mais de 24h em '${o.status}'`,
          tech: o.tech,
        })
      }

      if (o.slaStatus === 'warning') {
        alerts.push({
          id: `${o.id}-warning`,
          type: 'warning',
          title: `OS ${o.shortId} perto do prazo`,
          message: `SLA expira em breve`,
          tech: o.tech,
        })
      }

      if (o.status === 'Em Auditoria' && hoursSinceUpdate > 12) {
        alerts.push({
          id: `${o.id}-audit`,
          type: 'audit',
          title: `OS ${o.shortId} em auditoria prolongada`,
          message: `Revisão pendente > 12h`,
          tech: o.tech,
        })
      }
    })
  }

  if (!isLoading && !error && alerts.length === 0) {
    alerts.push({
      id: 'mock-1',
      type: 'stuck',
      title: 'Sem alertas críticos',
      message: 'A operação está fluindo perfeitamente.',
      tech: 'Sistema',
    })
  }

  const designationQueueOrders = Array.isArray(orders)
    ? orders.filter((o: any) => ['Pendente', 'Agendado', 'Em Execução'].includes(o.status))
    : []

  if (isLoading) {
    return (
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 sm:w-80" />
              <Skeleton className="h-4 w-48 sm:w-96" />
            </div>
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] flex-col gap-4 p-4">
        <Alert variant="destructive" className="max-w-md shadow-sm border-destructive/50">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="font-semibold">Erro na comunicação com o servidor</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>Não foi possível carregar os dados do dashboard.</p>
            <p className="text-xs opacity-80 font-mono bg-destructive/10 p-2 rounded break-words">
              Detalhes: {error}
            </p>
          </AlertDescription>
        </Alert>
        <Button onClick={fetchOrders} variant="outline" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
        <Alert className="bg-amber-500/10 border-amber-500/20 animate-fade-in">
          <InfoIcon className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-500 font-semibold">
            Aviso sobre Persistência de Dados
          </AlertTitle>
          <AlertDescription className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Como o projeto ainda não está conectado a um banco de dados definitivo (Supabase ou Skip
            Cloud), qualquer dado recuperado do backend está residindo atualmente na memória do
            servidor e será redefinido caso o servidor seja reiniciado.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {companyLogo && (
              <div className="hidden sm:block">
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-14 w-auto object-contain drop-shadow-sm"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard Operacional</h2>
              <p className="text-muted-foreground">
                Monitoramento em tempo real de contratos, serviços e projetos.
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                Exportar em PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
                <TableIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                Exportar em CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DashboardFilters />

        <DashboardCards />

        <div className="space-y-4 my-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Fila de Designação
            </h3>
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {designationQueueOrders.length} OS Pendentes/Ativas
            </Badge>
          </div>
          <OrderTable orders={designationQueueOrders} />
        </div>

        <KanbanSummary />

        <ContractWidgets />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <DashboardCharts />
            <TechnicianLeaderboard />
          </div>

          <div className="xl:col-span-1 space-y-6">
            <Card className="h-full animate-slide-up" style={{ animationDelay: '600ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-warning" />
                  Alertas Inteligentes
                </CardTitle>
                <Badge variant="secondary">
                  {alerts[0]?.id === 'mock-1' ? '0' : alerts.length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex flex-col gap-1 border-l-2 pl-3 py-2 rounded-r-md ${
                        alert.type === 'stuck'
                          ? 'border-muted-foreground bg-muted/30'
                          : alert.type === 'warning'
                            ? 'border-warning bg-warning/10'
                            : 'border-destructive bg-destructive/10'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold">{alert.title}</span>
                        {alert.type === 'warning' && (
                          <Clock className="h-3 w-3 text-warning mt-1" />
                        )}
                        {alert.type === 'stuck' && (
                          <AlertTriangle className="h-3 w-3 text-muted-foreground mt-1" />
                        )}
                        {alert.type === 'audit' && (
                          <ShieldAlert className="h-3 w-3 text-destructive mt-1" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{alert.message}</span>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium text-foreground/80">{alert.tech}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PrintableReport />
    </>
  )
}
