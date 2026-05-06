import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ArrowLeft,
  Search,
  Plus,
  List,
  Kanban,
  FileText,
  ClipboardList,
  CalendarIcon,
  X,
  Trash2,
  Loader2,
} from 'lucide-react'
import OrderTable from '@/components/admin/OrderTable'
import OrderKanban from '@/components/admin/OrderKanban'
import CreateOrderDialog from '@/components/admin/CreateOrderDialog'
import useAppStore, { Order, Contract } from '@/stores/useAppStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

export default function WorkOrders() {
  const { toast } = useToast()
  const {
    contracts,
    orders,
    contractUnits,
    deletedOrders = [],
    isLoadingOrders,
  } = useAppStore() as any
  const { hasPermission } = useAuthStore()
  const canCreateOS = hasPermission('create_service_order')
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [view, setView] = useState('list')
  const [activeTab, setActiveTab] = useState('active')
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  // Contract Panel Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all')
  const [techFilter, setTechFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleOpenDetails = (order: Order) => {
    navigate(`/ordens/${order.id}`)
  }

  const getContractStatus = (c: Contract) => {
    const endDate = new Date(c.endDate)
    const now = new Date()
    if (endDate < now) return { label: 'Vencido', variant: 'destructive' as const }
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
    if (diffDays <= 30) return { label: 'Vence em breve', variant: 'secondary' as const }
    return { label: 'Ativo', variant: 'default' as const }
  }

  // --- CONTRACT SELECTION VIEW ---
  if (!selectedContractId) {
    return (
      <div className="space-y-6 h-full flex flex-col animate-fade-in pb-10 relative">
        {isLoadingOrders && (
          <div className="absolute inset-0 z-50 bg-background/50 flex items-center justify-center backdrop-blur-sm rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Painel de Contratos</h2>
          <p className="text-sm text-muted-foreground">
            Selecione um contrato para gerenciar suas Ordens de Serviço.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contracts.map((c) => {
            const contractOrders = orders.filter((o) => o.contractId === c.id)
            const status = getContractStatus(c)

            return (
              <Card
                key={c.id}
                className="hover:border-primary hover:shadow-md cursor-pointer transition-all"
                onClick={() => setSelectedContractId(c.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={status.variant}
                      className={
                        status.variant === 'secondary'
                          ? 'bg-warning/20 text-warning border-warning/50'
                          : ''
                      }
                    >
                      {status.label}
                    </Badge>
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{c.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {c.clientName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end border-t pt-4">
                    <div>
                      <span className="text-3xl font-bold">{contractOrders.length}</span>
                      <span className="text-xs text-muted-foreground block mt-1">
                        Ordens de Serviço
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
                        {c.contractNumber}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {contracts.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum contrato cadastrado no sistema.
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- SPECIFIC CONTRACT PANEL VIEW ---
  const contract = contracts.find((c) => c.id === selectedContractId)
  if (!contract) return null

  const contractOrders = orders.filter((o) => o.contractId === selectedContractId)

  const contractDeletedOrders = deletedOrders.filter(
    (o: any) => o.contractId === selectedContractId,
  )

  const filteredDeletedOrders = contractDeletedOrders.filter((o: any) => {
    if (
      search &&
      !o.title.toLowerCase().includes(search.toLowerCase()) &&
      !o.shortId.toLowerCase().includes(search.toLowerCase()) &&
      !(o.unitPrefix || '').toLowerCase().includes(search.toLowerCase()) &&
      !(o.unitName || '').toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (serviceTypeFilter !== 'all' && o.serviceType !== serviceTypeFilter) return false
    if (techFilter !== 'all' && o.technicianId !== techFilter && o.teamId !== techFilter)
      return false
    if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false
    if (unitFilter !== 'all' && o.unitId !== unitFilter) return false

    const oDate = new Date(o.date).getTime()
    if (dateFrom && oDate < new Date(dateFrom).getTime()) return false
    if (dateTo && oDate > new Date(dateTo).getTime() + 86400000) return false

    return true
  })

  const filteredOrders = contractOrders.filter((o: any) => {
    if (
      search &&
      !o.title.toLowerCase().includes(search.toLowerCase()) &&
      !o.shortId.toLowerCase().includes(search.toLowerCase()) &&
      !(o.unitPrefix || '').toLowerCase().includes(search.toLowerCase()) &&
      !(o.unitName || '').toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (serviceTypeFilter !== 'all' && o.serviceType !== serviceTypeFilter) return false
    if (techFilter !== 'all' && o.technicianId !== techFilter && o.teamId !== techFilter)
      return false
    if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false
    if (unitFilter !== 'all' && o.unitId !== unitFilter) return false

    const oDate = new Date(o.date).getTime()
    if (dateFrom && oDate < new Date(dateFrom).getTime()) return false
    if (dateTo && oDate > new Date(dateTo).getTime() + 86400000) return false

    return true
  })

  // Unique techs for filter
  const availableTechs = Array.from(
    new Map(
      contractOrders
        .filter((o) => o.technicianId || o.teamId)
        .map((o) => [o.technicianId || o.teamId, { id: o.technicianId || o.teamId, name: o.tech }]),
    ).values(),
  )

  const availableUnits = contractUnits.filter((u: any) => u.contractId === selectedContractId)

  const handleRestore = (order: Order) => {
    useAppStore.setState((state: any) => {
      const restoredOrder = { ...order }
      delete (restoredOrder as any).deletedAt
      return {
        deletedOrders: state.deletedOrders.filter((o: any) => o.id !== order.id),
        orders: [...state.orders, restoredOrder],
        filteredOrders: [...state.filteredOrders, restoredOrder],
      }
    })
    toast({ title: 'Sucesso', description: 'Ordem de Serviço restaurada com sucesso.' })
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in pb-10 relative">
      {isLoadingOrders && (
        <div className="absolute inset-0 z-50 bg-background/50 flex items-center justify-center backdrop-blur-sm rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedContractId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">{contract.name}</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {contract.clientName} • {contract.contractNumber}
            </p>
          </div>
        </div>
        {canCreateOS && (
          <Button onClick={() => setCreateOpen(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nova OS
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 bg-card p-4 rounded-lg border shadow-sm items-center">
        <div className="flex items-center gap-2 text-muted-foreground mr-2 shrink-0">
          <ClipboardList className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros da Fila:</span>
        </div>
        <div className="flex-1 min-w-[150px] relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar OS ou Agência..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Agência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Agências</SelectItem>
            {availableUnits.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                [{u.prefix}] {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="deslocamento">Em Deslocamento</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
            <SelectItem value="in_audit">Em Auditoria</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            <SelectItem value="eletrica">Elétrica</SelectItem>
            <SelectItem value="hidraulica">Hidráulica</SelectItem>
            <SelectItem value="civil">Civil</SelectItem>
            <SelectItem value="climatizacao">Climatização</SelectItem>
            <SelectItem value="preventiva">Preventiva</SelectItem>
            <SelectItem value="corretiva">Corretiva</SelectItem>
            <SelectItem value="pintura">Pintura</SelectItem>
            <SelectItem value="estrutural">Estrutural</SelectItem>
            <SelectItem value="facilities">Facilities</SelectItem>
            <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
            <SelectItem value="limpeza_tecnica">Limpeza Técnica</SelectItem>
            <SelectItem value="vistoria">Vistoria</SelectItem>
            <SelectItem value="emergencial">Emergencial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={techFilter} onValueChange={setTechFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {availableTechs.map((t) => (
              <SelectItem key={t.id} value={t.id!}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[190px] justify-start text-left font-normal ${!dateFrom && !dateTo ? 'text-muted-foreground' : ''}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom || dateTo ? (
                <span className="truncate">
                  {dateFrom ? new Date(dateFrom).toLocaleDateString() : 'Início'} -{' '}
                  {dateTo ? new Date(dateTo).toLocaleDateString() : 'Fim'}
                </span>
              ) : (
                <span>Filtrar Período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Data Inicial</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Data Final</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  <X className="w-3 h-3 mr-1" /> Limpar Período
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              <List className="h-4 w-4 mr-2" />
              Ativas
            </TabsTrigger>
            <TabsTrigger value="deleted">
              <Trash2 className="h-4 w-4 mr-2" />
              Lixeira
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'active' && (
          <Tabs value={view} onValueChange={setView} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <Kanban className="h-4 w-4 mr-2" />
                Quadro
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="flex-1 mt-2">
        {activeTab === 'active' ? (
          view === 'list' ? (
            <OrderTable orders={filteredOrders} onRowClick={handleOpenDetails} />
          ) : (
            <OrderKanban orders={filteredOrders} onCardClick={handleOpenDetails} />
          )
        ) : (
          <OrderTable orders={filteredDeletedOrders} isDeletedView onRestore={handleRestore} />
        )}
      </div>

      {canCreateOS && (
        <CreateOrderDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          defaultContractId={contract.id}
        />
      )}
    </div>
  )
}
