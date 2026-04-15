import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import useAppStore from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { toast } from '@/hooks/use-toast'
import { UserPlus } from 'lucide-react'
import CreateClientDialog from '@/components/admin/CreateClientDialog'

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultContractId?: string
  defaultTeamId?: string
  defaultDate?: Date
}

export default function CreateOrderDialog({
  open,
  onOpenChange,
  defaultContractId,
}: CreateOrderDialogProps) {
  const appStore = useAppStore() as any
  const { clients, contracts, createOrder } = appStore
  const { technicians } = useOperationalStore()
  const [formData, setFormData] = useState<any>({ priority: 'medium', status: 'pending' })
  const [showClientDialog, setShowClientDialog] = useState(false)

  useEffect(() => {
    if (open) {
      let initData: any = { priority: 'medium', status: 'pending', description: '' }

      if (defaultContractId) {
        const contract = contracts?.find((c: any) => c.id === defaultContractId)
        if (contract) {
          initData = { ...initData, clientId: contract.clientId }
        }
      }

      setFormData(initData)
    }
  }, [open, defaultContractId, contracts])

  const handleSave = async () => {
    try {
      const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)

      if (!formData.description || !formData.clientId) {
        toast({
          title: 'Aviso',
          description: 'Preencha a descrição e o cliente.',
          variant: 'destructive',
        })
        return
      }

      if (!isUUID(formData.clientId)) {
        toast({
          title: 'Aviso',
          description: 'O cliente selecionado é inválido. Por favor, selecione um cliente real.',
          variant: 'destructive',
        })
        return
      }

      const payload: any = {
        client_id: formData.clientId,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
      }

      if (formData.technicianId) {
        payload.technician_id = formData.technicianId
      }

      await createOrder(payload)

      window.dispatchEvent(new Event('service-order-created'))

      if (typeof appStore.fetchOrders === 'function') {
        await appStore.fetchOrders()
      } else if (typeof appStore.loadOrders === 'function') {
        await appStore.loadOrders()
      } else if (typeof appStore.fetchData === 'function') {
        await appStore.fetchData()
      } else {
        // Fallback for Index page dynamic rendering refresh
        setTimeout(() => window.location.reload(), 1000)
      }

      toast({ title: 'Sucesso', description: 'OS criada com sucesso. A lista será atualizada.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro ao criar OS',
        description: e.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título / Descrição</Label>
            <Textarea
              placeholder="Descreva o problema ou solicitação..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.clientId || undefined}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      clientId: v,
                    })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      ?.filter(
                        (c: any) =>
                          c.id &&
                          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                            c.id,
                          ),
                      )
                      .map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name || 'Sem Nome'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowClientDialog(true)}
                  title="Novo Cliente"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.priority || 'medium'}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="deslocamento">Em Deslocamento</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="in_audit">Em Auditoria</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Técnico Responsável</Label>
              <Select
                value={formData.technicianId || undefined}
                onValueChange={(v) => {
                  setFormData({ ...formData, technicianId: v })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um Técnico..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians
                    ?.filter(
                      (t: any) =>
                        t.status === 'active' &&
                        t.id &&
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                          t.id,
                        ),
                    )
                    .map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name || 'Sem Nome'}
                      </SelectItem>
                    ))}
                </SelectContent>{' '}
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Criar OS</Button>
        </DialogFooter>
      </DialogContent>
      <CreateClientDialog open={showClientDialog} onOpenChange={setShowClientDialog} />
    </Dialog>
  )
}
