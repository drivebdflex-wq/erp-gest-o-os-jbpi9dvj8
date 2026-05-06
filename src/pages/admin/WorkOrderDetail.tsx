import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  History,
  MoreVertical,
  Copy,
  FileText,
  FileSearch,
  Building,
  Briefcase,
  Activity,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { StorageService } from '@/services/storage.service'
import { AuditsRepository } from '@/services/repositories/auxiliary.repository'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GeneralTab,
  ServiceTab,
  ExecutionTab,
  BudgetTab,
  EvidenceTab,
  AdminTab,
} from '@/components/admin/OSFormTabs'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { orders, updateOrder } = useAppStore() as any
  const user = useAuthStore((state: any) => state.user)
  const { technicians, teams } = useOperationalStore()
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const [order, setOrder] = useState<any>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [audits, setAudits] = useState<any[]>([])

  const [formData, setFormData] = useState({
    order_number: '',
    call_code: '',
    ticket_number: '',
    dependency: '',
    agency_code: '',
    os_type: '',
    warranty: false,
    opening_date: '',
    acceptance_date: '',
    contract_id: '',
    asset_number: '',
    requested_by: '',
    client_unit: '',
    status: 'pending',
    priority: 'medium',
    service_type: 'preventiva',
    criticality: '',
    sla_status: 'within_sla',
    description: '',
    client_request: '',
    diagnostics: '',
    procedures_executed: '',
    pending_issues: '',
    risks_found: '',
    general_observations: '',
    technical_recommendations: '',
    operational_checklist: '',
    technician_id: '',
    team_id: '',
    supervisor_id: '',
    vehicle_used: '',
    tools_used: '',
    displacement_time: 0,
    execution_duration: 0,
    scheduled_at: '',
    started_at: '',
    finished_at: '',
    deadline_at: '',
    displacement_cost: 0,
    labor_cost: 0,
    material_cost: 0,
    discount: 0,
    total_cost: 0,
    items: [] as any[],
    technician_signature_url: '',
    client_signature_url: '',
    client_signature_name: '',
    client_signature_position: '',
    supervisor_signature_url: '',
    sector: '',
    reference_point: '',
    root_cause: '',
    km_driven: 0,
    floor: '',
    city: '',
    state: '',
    address: '',
    attachments: [] as any[],
    cost_center: '',
    internal_code: '',
    billing_type: '',
    billing_status: 'pending',
    approval_status: 'pending',
    supervisor_approval: false,
    client_approval: false,
    is_billed: false,
    notes: '',
  })

  const loadAudits = async () => {
    if (!id) return
    const res = await AuditsRepository.findAll()
    setAudits(
      res
        .filter((a) => a.record_id === id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    )
  }

  useEffect(() => {
    if (id && orders) {
      const found = orders.find((o: any) => o.id === id)
      if (found) {
        setOrder(found)
        setFormData({
          order_number: found.order_number || found.shortId || `OS-${found.id?.substring(0, 8)}`,
          call_code: found.call_code || '',
          ticket_number: found.ticket_number || '',
          dependency: found.dependency || '',
          agency_code: found.agency_code || '',
          os_type: found.os_type || '',
          warranty: found.warranty || false,
          opening_date: found.opening_date
            ? new Date(found.opening_date).toISOString().slice(0, 16)
            : found.date
              ? new Date(found.date).toISOString().slice(0, 16)
              : '',
          acceptance_date: found.acceptance_date
            ? new Date(found.acceptance_date).toISOString().slice(0, 16)
            : '',
          contract_id: found.contractName || found.contractId || found.contract_id || '',
          asset_number: found.asset_number || '',
          requested_by: found.requested_by || '',
          client_unit: found.client_unit || found.unitName || '',
          status: found.status || 'pending',
          priority: found.priority || 'medium',
          service_type: found.service_type || found.serviceType || 'preventiva',
          criticality: found.criticality || '',
          sla_status: found.sla_status || 'within_sla',
          description: found.description || found.title || '',
          client_request: found.client_request || '',
          diagnostics: found.diagnostics || '',
          procedures_executed: found.procedures_executed || '',
          pending_issues: found.pending_issues || '',
          risks_found: found.risks_found || '',
          general_observations: found.general_observations || '',
          technical_recommendations: found.technical_recommendations || '',
          operational_checklist: found.operational_checklist || '',
          technician_id: found.technician_id || found.technicianId || '',
          team_id: found.team_id || found.teamId || '',
          supervisor_id: found.supervisor_id || '',
          vehicle_used: found.vehicle_used || '',
          tools_used: found.tools_used || '',
          displacement_time: found.displacement_time || 0,
          execution_duration: found.execution_duration || found.total_duration_minutes || 0,
          scheduled_at: found.scheduled_at
            ? new Date(found.scheduled_at).toISOString().slice(0, 16)
            : '',
          started_at: found.started_at ? new Date(found.started_at).toISOString().slice(0, 16) : '',
          finished_at: found.finished_at
            ? new Date(found.finished_at).toISOString().slice(0, 16)
            : '',
          deadline_at: found.deadline_at
            ? new Date(found.deadline_at).toISOString().slice(0, 16)
            : '',
          displacement_cost: found.displacement_cost || 0,
          labor_cost: found.labor_cost || 0,
          material_cost: found.material_cost || 0,
          discount: found.discount || 0,
          total_cost: found.total_cost || found.serviceValue || 0,
          items: found.items || [],
          attachments: found.attachments || [],
          technician_signature_url: found.technician_signature_url || '',
          client_signature_url: found.client_signature_url || '',
          client_signature_name: found.client_signature_name || '',
          client_signature_position: found.client_signature_position || '',
          supervisor_signature_url: found.supervisor_signature_url || '',
          sector: found.sector || '',
          reference_point: found.reference_point || '',
          root_cause: found.root_cause || '',
          km_driven: found.km_driven || 0,
          floor: found.floor || '',
          city: found.city || '',
          state: found.state || '',
          address: found.address || '',
          cost_center: found.cost_center || '',
          internal_code: found.internal_code || '',
          billing_type: found.billing_type || '',
          billing_status: found.billing_status || 'pending',
          approval_status: found.approval_status || 'pending',
          supervisor_approval: found.supervisor_approval || false,
          client_approval: found.client_approval || false,
          is_billed: found.is_billed || false,
          notes: found.notes || '',
        })
        loadAudits()
      }
    }
  }, [id, orders])

  useEffect(() => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0,
    )
    const total =
      (Number(formData.displacement_cost) || 0) +
      (Number(formData.labor_cost) || 0) +
      itemsTotal -
      (Number(formData.discount) || 0)

    if (formData.material_cost !== itemsTotal || formData.total_cost !== total) {
      setFormData((prev) => ({ ...prev, material_cost: itemsTotal, total_cost: total }))
    }
  }, [formData.items, formData.displacement_cost, formData.labor_cost, formData.discount])

  const calculateTotals = () => {
    // Automatic calculation via useEffect
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price =
        (Number(newItems[index].quantity) || 0) * (Number(newItems[index].unit_price) || 0)
    }
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const handleAddItem = () =>
    setFormData((p) => ({
      ...p,
      items: [
        ...p.items,
        {
          id: Date.now().toString(),
          description: '',
          unit: 'UN',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    }))

  const handleRemoveItem = (index: number) => {
    const n = [...formData.items]
    n.splice(index, 1)
    setFormData((p) => ({ ...p, items: n }))
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string = 'general',
  ) => {
    if (!e.target.files) return
    try {
      const files = Array.from(e.target.files)
      const newAtt = [...formData.attachments]
      for (const file of files) {
        const url = await StorageService.uploadFile('os-attachments', file)
        newAtt.push({
          id: Math.random().toString(),
          fileName: file.name,
          url,
          type,
          createdAt: new Date().toISOString(),
        })
      }
      setFormData((p) => ({ ...p, attachments: newAtt }))
      toast({ title: 'Upload concluído' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleSave = async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await updateOrder(id, { ...formData, serviceValue: formData.total_cost })
      toast({ title: 'Sucesso', description: 'OS atualizada com sucesso.' })
      loadAudits()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/service-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      useAppStore.setState((state: any) => ({
        orders: state.orders.filter((o: any) => o.id !== id),
        filteredOrders: state.filteredOrders.filter((o: any) => o.id !== id),
      }))
      toast({ title: 'Excluído', description: 'Ordem de Serviço excluída.' })
      navigate('/ordens')
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  if (!order) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="space-y-6 h-full flex flex-col pb-10 max-w-7xl mx-auto animate-fade-in pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/ordens')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              {formData.order_number ? `${formData.order_number}` : 'Carregando OS...'}
              {readOnly && (
                <span className="text-xs font-normal bg-secondary px-2 py-1 rounded">
                  Visualização
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Gerenciamento de Ordem de Serviço
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none">
                <MoreVertical className="w-4 h-4 mr-2" /> Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setReadOnly(!readOnly)}>
                <FileSearch className="w-4 h-4 mr-2" />{' '}
                {readOnly ? 'Modo Edição' : 'Modo Leitura (View)'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <FileText className="w-4 h-4 mr-2" /> Imprimir / Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: 'Duplicar',
                    description: 'Nova OS em rascunho com base nesta criada.',
                  })
                }}
              >
                <Copy className="w-4 h-4 mr-2" /> Duplicar OS
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir OS
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!readOnly && (
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none">
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar Alterações
            </Button>
          )}
        </div>
      </div>

      {/* High Density ERP Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-2">
        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 flex flex-col justify-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
              <Building className="w-3 h-3" /> Cliente
            </div>
            <div className="font-bold text-sm truncate">{order?.client || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 flex flex-col justify-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
              <Briefcase className="w-3 h-3" /> Contrato
            </div>
            <div className="font-bold text-sm truncate">{formData.contract_id || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 flex flex-col justify-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3" /> Status
            </div>
            <div className="font-bold text-sm truncate uppercase text-primary">
              {formData.status}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 flex flex-col justify-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3" /> Prioridade
            </div>
            <div className="font-bold text-sm truncate uppercase">{formData.priority}</div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 flex flex-col justify-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" /> SLA
            </div>
            <div
              className={`font-bold text-sm truncate uppercase ${formData.sla_status === 'within_sla' ? 'text-green-600' : 'text-destructive'}`}
            >
              {formData.sla_status === 'within_sla' ? 'No Prazo' : formData.sla_status}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-3 flex flex-col justify-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Abertura
            </div>
            <div className="font-bold text-sm truncate">
              {formData.opening_date ? new Date(formData.opening_date).toLocaleDateString() : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={readOnly ? 'pointer-events-none opacity-90 select-none print-friendly' : ''}>
        <Tabs defaultValue="geral" className="w-full bg-card rounded-lg shadow-sm border">
          <div className="border-b px-4 py-2 bg-muted/20 overflow-x-auto">
            <TabsList className="flex md:grid md:grid-cols-7 h-auto p-1 min-w-[900px] bg-transparent">
              <TabsTrigger
                value="geral"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Geral / Local
              </TabsTrigger>
              <TabsTrigger
                value="servico"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Atendimento
              </TabsTrigger>
              <TabsTrigger
                value="execucao"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Execução
              </TabsTrigger>
              <TabsTrigger
                value="orcamento"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Materiais
              </TabsTrigger>
              <TabsTrigger
                value="evidencias"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Evidências
              </TabsTrigger>
              <TabsTrigger
                value="historico"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Auditoria
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-background data-[state=active]:shadow"
              >
                Admin
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6 min-h-[500px]">
            <TabsContent value="geral" className="m-0 focus-visible:outline-none">
              <GeneralTab data={formData} set={setFormData} />
            </TabsContent>
            <TabsContent value="servico" className="m-0 focus-visible:outline-none">
              <ServiceTab data={formData} set={setFormData} />
            </TabsContent>
            <TabsContent value="execucao" className="m-0 focus-visible:outline-none">
              <ExecutionTab
                data={formData}
                set={setFormData}
                technicians={technicians}
                teams={teams}
              />
            </TabsContent>
            <TabsContent value="orcamento" className="m-0 focus-visible:outline-none">
              <BudgetTab
                data={formData}
                set={setFormData}
                calculateTotals={calculateTotals}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
                handleItemChange={handleItemChange}
              />
            </TabsContent>
            <TabsContent value="evidencias" className="m-0 focus-visible:outline-none">
              <EvidenceTab
                data={formData}
                set={setFormData}
                attachments={formData.attachments}
                setAttachments={(v: any) => setFormData({ ...formData, attachments: v })}
                onUpload={handleFileUpload}
                onRemove={(id: string) =>
                  setFormData({
                    ...formData,
                    attachments: formData.attachments.filter((a) => a.id !== id),
                  })
                }
              />
            </TabsContent>
            <TabsContent value="admin" className="m-0 focus-visible:outline-none">
              <AdminTab data={formData} set={setFormData} />
            </TabsContent>
            <TabsContent value="historico" className="m-0 focus-visible:outline-none">
              <div className="space-y-6">
                <h3 className="font-bold flex items-center gap-2 text-xl text-primary">
                  <History className="w-6 h-6" /> Timeline de Auditoria
                </h3>
                <div className="relative border-l-2 border-primary/30 ml-3 space-y-8 pb-4">
                  {audits.map((a) => (
                    <div key={a.id} className="relative pl-6">
                      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="bg-card border rounded-lg p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                          <div className="font-semibold text-base">
                            {a.action === 'CREATE'
                              ? 'Criação da Ordem de Serviço'
                              : `Atualização de Registro (${a.action})`}
                          </div>
                          <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-md">
                            {new Date(a.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Usuário Responsável:{' '}
                          <span className="font-medium text-foreground">
                            {a.user_name || 'Sistema ERP'}
                          </span>
                        </div>

                        {a.action === 'UPDATE' && a.old_value?.status !== a.new_value?.status && (
                          <div className="text-sm bg-secondary/30 p-3 rounded-md border flex items-center flex-wrap gap-3">
                            <span className="font-semibold">Transição de Status:</span>
                            <Badge variant="outline" className="line-through opacity-70">
                              {a.old_value?.status || 'N/A'}
                            </Badge>
                            <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                            <Badge className="bg-primary">{a.new_value?.status}</Badge>
                          </div>
                        )}

                        {a.action === 'UPDATE' && a.new_value?.change && (
                          <div className="text-sm mt-2 font-medium">{a.new_value.change}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {audits.length === 0 && (
                    <div className="pl-6 text-muted-foreground">
                      Nenhum histórico de eventos encontrado.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja prosseguir com a exclusão da OS{' '}
              {formData.order_number}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
