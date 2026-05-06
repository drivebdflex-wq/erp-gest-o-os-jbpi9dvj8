import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Trash2, Loader2, History } from 'lucide-react'
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
  const isAdmin = user?.role === 'admin' || user?.role === 'Administrator'

  const [order, setOrder] = useState<any>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [audits, setAudits] = useState<any[]>([])

  const [formData, setFormData] = useState({
    order_number: '',
    call_code: '',
    contract_id: '',
    asset_number: '',
    requested_by: '',
    client_unit: '',
    status: 'pending',
    priority: 'medium',
    service_type: 'preventiva',
    description: '',
    diagnostics: '',
    technician_id: '',
    team_id: '',
    scheduled_at: '',
    started_at: '',
    finished_at: '',
    deadline_at: '',
    displacement_cost: 0,
    labor_cost: 0,
    material_cost: 0,
    total_cost: 0,
    items: [] as any[],
    technician_signature_url: '',
    client_signature_url: '',
    attachments: [] as any[],
    cost_center: '',
    billing_status: 'pending',
    approval_status: 'pending',
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
          order_number: found.order_number || found.shortId || '',
          call_code: found.call_code || '',
          contract_id: found.contractId || '',
          asset_number: found.asset_number || '',
          requested_by: found.requested_by || '',
          client_unit: found.client_unit || found.unitName || '',
          status: found.status || 'pending',
          priority: found.priority || 'medium',
          service_type: found.service_type || found.serviceType || 'preventiva',
          description: found.description || '',
          diagnostics: found.diagnostics || '',
          technician_id: found.technician_id || found.technicianId || '',
          team_id: found.team_id || found.teamId || '',
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
          total_cost: found.total_cost || found.serviceValue || 0,
          items: found.items || [],
          attachments: found.attachments || [],
          technician_signature_url: found.technician_signature_url || '',
          client_signature_url: found.client_signature_url || '',
          cost_center: found.cost_center || '',
          billing_status: found.billing_status || 'pending',
          approval_status: found.approval_status || 'pending',
          notes: found.notes || '',
        })
        loadAudits()
      }
    }
  }, [id, orders])

  const calculateTotals = () => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0,
    )
    const total = Number(formData.displacement_cost) + Number(formData.labor_cost) + itemsTotal
    setFormData((prev) => ({ ...prev, material_cost: itemsTotal, total_cost: total }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price =
        Number(newItems[index].quantity) * Number(newItems[index].unit_price)
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  }

  if (!order) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="space-y-6 h-full flex flex-col pb-10 max-w-5xl mx-auto animate-fade-in pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/ordens')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              OS {formData.order_number}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Facilities & Manutenção Predial
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {isAdmin && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAlert(true)}
              className="flex-1 md:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}{' '}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full border rounded-lg bg-card shadow-sm">
        <div className="border-b px-4 py-2 bg-muted/20 overflow-x-auto">
          <TabsList className="flex md:grid md:grid-cols-7 h-auto p-1 min-w-[750px]">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="servico">Serviço</TabsTrigger>
            <TabsTrigger value="execucao">Execução</TabsTrigger>
            <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            <TabsTrigger value="evidencias">Evidências</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="admin">Administrativo</TabsTrigger>
          </TabsList>
        </div>
        <div className="p-4 md:p-6">
          <TabsContent value="geral" className="m-0">
            <GeneralTab data={formData} set={setFormData} />
          </TabsContent>
          <TabsContent value="servico" className="m-0">
            <ServiceTab data={formData} set={setFormData} />
          </TabsContent>
          <TabsContent value="execucao" className="m-0">
            <ExecutionTab
              data={formData}
              set={setFormData}
              technicians={technicians}
              teams={teams}
            />
          </TabsContent>
          <TabsContent value="orcamento" className="m-0">
            <BudgetTab
              data={formData}
              set={setFormData}
              calculateTotals={calculateTotals}
              handleAddItem={handleAddItem}
              handleRemoveItem={handleRemoveItem}
              handleItemChange={handleItemChange}
            />
          </TabsContent>
          <TabsContent value="evidencias" className="m-0">
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
          <TabsContent value="admin" className="m-0">
            <AdminTab data={formData} set={setFormData} />
          </TabsContent>
          <TabsContent value="historico" className="m-0">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <History className="w-4 h-4" /> Histórico de Alterações
              </h3>
              {audits.map((a) => (
                <div
                  key={a.id}
                  className="border-l-2 border-primary pl-4 py-2 bg-secondary/10 text-sm"
                >
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                  <div className="font-medium">
                    {a.action === 'CREATE'
                      ? 'OS Criada'
                      : a.new_value?.change || 'Dados Atualizados'}
                  </div>
                </div>
              ))}
              {audits.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum histórico de eventos encontrado.
                </p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja prosseguir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
