import { useEffect, useState } from 'react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  History,
  Trash2,
  Loader2,
  Upload,
  X,
  Download,
  Paperclip,
  DollarSign,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
// @ts-expect-error - dynamic store import
import useAuthStore from '@/stores/useAuthStore'
import useAppStore, { SERVICE_TYPE_COLORS, SERVICE_TYPE_LABELS } from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
// @ts-expect-error - dynamic store import
import useFinanceStore from '@/stores/useFinanceStore'
import { AuditsRepository } from '@/services/repositories/auxiliary.repository'
import { StorageService } from '@/services/storage.service'
import { cn } from '@/lib/utils'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any | null
}

const MOCK_PRICE_TABLE: Record<string, number> = {
  eletrica: 150.0,
  hidraulica: 120.0,
  civil: 200.0,
  serralheria: 180.0,
  marmoraria: 250.0,
  marcenaria: 190.0,
}

export default function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  // @ts-expect-error - store type mapping
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const { technicians, teams } = useOperationalStore()
  const { updateOrder } = useAppStore()

  const [audits, setAudits] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: 'civil',
    status: 'pending',
    priority: 'medium',
    scheduledAt: '',
    responsible: '',
    serviceValue: 0,
    observations: '',
  })

  const loadAudits = async () => {
    if (!order) return
    const res = await AuditsRepository.findAll()
    setAudits(
      res
        .filter((a) => a.record_id === order.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    )
  }

  useEffect(() => {
    if (open && order) {
      setFormData({
        title: order.title || '',
        description: order.description || '',
        serviceType: order.serviceType || 'civil',
        status: order.status || 'pending',
        priority: order.priority || 'medium',
        scheduledAt: order.scheduledAt
          ? new Date(order.scheduledAt).toISOString().slice(0, 16)
          : '',
        responsible: order.technicianId || (order.teamId ? `team_${order.teamId}` : ''),
        serviceValue: order.serviceValue || 0,
        observations: order.observations || '',
      })
      setAttachments(order.attachments || [])
      loadAudits()
    }
  }, [open, order])

  if (!order) return null

  const handleServiceTypeChange = (val: string) => {
    const newPrice = MOCK_PRICE_TABLE[val] || 0
    setFormData((prev) => ({ ...prev, serviceType: val, serviceValue: newPrice }))
  }

  const handleDelete = async () => {
    if (!order) return
    setIsDeleting(true)
    try {
      useAppStore.setState((state: any) => ({
        orders: state.orders.filter((o: any) => o.id !== order.id),
        filteredOrders: state.filteredOrders.filter((o: any) => o.id !== order.id),
      }))
      toast({ title: 'Sucesso', description: 'Ordem de Serviço excluída com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao excluir OS.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  const handleSave = async () => {
    if (!order) return
    setIsSaving(true)
    try {
      const changes = []
      if (formData.title !== order.title)
        changes.push(`Título: de "${order.title}" para "${formData.title}"`)
      if (formData.status !== order.status)
        changes.push(`Status: de "${order.status}" para "${formData.status}"`)
      if (formData.serviceValue !== (order.serviceValue || 0))
        changes.push(`Valor do serviço alterado para R$${formData.serviceValue}`)
      if (
        formData.responsible !==
        (order.technicianId || (order.teamId ? `team_${order.teamId}` : ''))
      )
        changes.push(`Responsável reatribuído`)
      if (formData.serviceType !== order.serviceType)
        changes.push(`Tipo de serviço alterado para ${formData.serviceType}`)
      if (formData.priority !== order.priority)
        changes.push(`Prioridade alterada para ${formData.priority}`)

      let techId = null
      let teamId = null
      if (formData.responsible.startsWith('team_')) {
        teamId = formData.responsible.replace('team_', '')
      } else if (formData.responsible) {
        techId = formData.responsible
      }

      const updates = {
        title: formData.title,
        description: formData.description,
        serviceType: formData.serviceType,
        status: formData.status,
        priority: formData.priority,
        scheduledAt: formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : undefined,
        technicianId: techId,
        teamId: teamId,
        serviceValue: Number(formData.serviceValue),
        observations: formData.observations,
        attachments,
      }

      await updateOrder(order.id, updates)
      window.dispatchEvent(new Event('service-order-updated'))

      // Integrates with useFinanceStore directly to inject Revenue
      if (updates.serviceValue > 0 && order.contractId) {
        useFinanceStore.setState((state: any) => {
          const existing = state.revenues.filter((r: any) => r.orderId !== order.id)
          return {
            revenues: [
              ...existing,
              {
                id: `rev-os-${order.id}`,
                contractId: order.contractId,
                orderId: order.id,
                date: new Date().toISOString(),
                value: updates.serviceValue,
                status: updates.status === 'completed' ? 'completed' : 'pending',
                type: 'servico_os',
                isFixed: false,
                category: 'receita_operacional',
              },
            ],
          }
        })
      }

      for (const change of changes) {
        await AuditsRepository.create({
          table_name: 'service_orders',
          record_id: order.id,
          action: 'UPDATE',
          new_value: { change },
        })
      }

      loadAudits()
      toast({ title: 'Sucesso', description: 'Ordem de Serviço salva com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao salvar OS.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)
    const files = Array.from(e.target.files)

    try {
      const newAttachments = [...attachments]
      for (const file of files) {
        const url = await StorageService.uploadFile('service-order-files', file)
        const newAtt = {
          id: Math.random().toString(),
          fileName: file.name,
          url,
          createdAt: new Date().toISOString(),
        }
        newAttachments.push(newAtt)

        await AuditsRepository.create({
          table_name: 'service_order_attachments',
          record_id: order.id,
          action: 'CREATE',
          new_value: { file_name: file.name },
        })
      }

      setAttachments(newAttachments)
      await updateOrder(order.id, { attachments: newAttachments })
      loadAudits()
      toast({ title: 'Upload concluído', description: `${files.length} arquivo(s) anexado(s).` })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveAttachment = async (attId: string, fileName: string) => {
    try {
      const updated = attachments.filter((a) => a.id !== attId)
      setAttachments(updated)
      await updateOrder(order.id, { attachments: updated })

      await AuditsRepository.create({
        table_name: 'service_order_attachments',
        record_id: order.id,
        action: 'DELETE',
        new_value: { attachment_id: attId, file_name: fileName },
      })
      loadAudits()
      toast({ title: 'Removido', description: 'Anexo removido com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao remover anexo.', variant: 'destructive' })
    }
  }

  const formatAuditAction = (audit: any) => {
    if (audit.action === 'CREATE') return 'Ordem de Serviço Criada'
    if (audit.new_value?.change) return audit.new_value.change
    if (audit.new_value?.file_name && audit.action === 'CREATE')
      return `Anexo adicionado: ${audit.new_value.file_name}`
    if (audit.new_value?.file_name && audit.action === 'DELETE')
      return `Anexo removido: ${audit.new_value.file_name}`
    if (audit.action === 'UPDATE') return 'Dados da Ordem Atualizados'
    return audit.action
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold tracking-tight">
                OS {order.shortId}
              </DialogTitle>
              <Badge
                variant="outline"
                className={cn(
                  'border shadow-sm',
                  SERVICE_TYPE_COLORS[order.serviceType as keyof typeof SERVICE_TYPE_COLORS],
                )}
              >
                {SERVICE_TYPE_LABELS[order.serviceType as keyof typeof SERVICE_TYPE_LABELS] ||
                  order.serviceType}
              </Badge>
            </div>
            <Badge
              variant={
                order.priority === 'urgent' || order.priority === 'high'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {order.priority === 'low'
                ? 'Baixa'
                : order.priority === 'medium'
                  ? 'Média'
                  : order.priority === 'high'
                    ? 'Alta'
                    : order.priority === 'urgent'
                      ? 'Urgente'
                      : order.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <User className="w-4 h-4" />
            <span>{order.client}</span>
            <span className="text-primary font-medium ml-2">
              {order.contractName || 'Sem Contrato'}
            </span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="dados" className="flex-1 overflow-hidden flex flex-col px-6 py-4">
          <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
            <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
            <TabsTrigger value="anexos">Anexos ({attachments.length})</TabsTrigger>
            <TabsTrigger value="historico">
              <History className="w-4 h-4 mr-2" /> Histórico
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <TabsContent value="dados" className="space-y-4 m-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Título / Descrição Curta</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição Completa</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Serviço</Label>
                  <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eletrica">Elétrica</SelectItem>
                      <SelectItem value="hidraulica">Hidráulica</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="serralheria">Serralheria</SelectItem>
                      <SelectItem value="marmoraria">Marmoraria</SelectItem>
                      <SelectItem value="marcenaria">Marcenaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente (Fila)</SelectItem>
                      <SelectItem value="scheduled">Agendado (Agenda)</SelectItem>
                      <SelectItem value="in_progress">Em Execução</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média (10 dias)</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente (48h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select
                    value={formData.responsible}
                    onValueChange={(v) => setFormData({ ...formData, responsible: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Não atribuído" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Equipes</SelectLabel>
                        {teams
                          .filter((t) => t.active !== false && t.id)
                          .map((t) => (
                            <SelectItem key={`team_${t.id}`} value={`team_${t.id}`}>
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Técnicos</SelectLabel>
                        {technicians
                          .filter((t) => t.status === 'active' && t.id)
                          .map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Agendada</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor do Serviço (R$)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-9"
                      value={formData.serviceValue}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceValue: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                    Registrado automaticamente como receita no contrato.
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Observações Internas</Label>
                  <Textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anexos" className="m-0 outline-none">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Arquivos e Documentos</h3>
                  <div>
                    <input
                      type="file"
                      multiple
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Novo Anexo
                    </Button>
                  </div>
                </div>
                {attachments.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                    Nenhum arquivo anexado a esta Ordem de Serviço.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Paperclip className="w-4 h-4 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium truncate" title={att.fileName}>
                              {att.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(att.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(att.url, '_blank')}
                            title="Baixar"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAttachment(att.id, att.fileName)}
                            title="Remover"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historico" className="m-0 outline-none">
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="border-l-2 border-primary pl-4 py-2 bg-secondary/10 rounded-r-md"
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(audit.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {formatAuditAction(audit)}
                    </div>
                  </div>
                ))}
                {audits.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Nenhum histórico de eventos encontrado.
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex gap-2 justify-between shrink-0 px-6 py-4 border-t bg-muted/30">
          <div>
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a OS <strong>{order?.shortId}</strong>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
