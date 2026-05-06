import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [formData, setFormData] = useState<any>({
    priority: 'medium',
    status: 'pending',
    service_type: 'preventiva',
  })
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

      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
      const randomStr = Math.floor(1000 + Math.random() * 9000).toString()
      const orderNumber = `${dateStr}${randomStr}`

      const payload: any = {
        client_id: formData.clientId,
        contract_id: formData.contractId,
        description: formData.description,
        priority: formData.priority,
        service_type: formData.service_type,
        status: 'pending',
        order_number: orderNumber,
      }

      const createdOrder = await createOrder(payload)

      window.dispatchEvent(new Event('service-order-created'))

      if (typeof appStore.fetchOrders === 'function') {
        await appStore.fetchOrders()
      } else if (typeof appStore.loadOrders === 'function') {
        await appStore.loadOrders()
      } else if (typeof appStore.fetchData === 'function') {
        await appStore.fetchData()
      }

      toast({ title: 'Sucesso', description: 'OS criada com sucesso.' })
      onOpenChange(false)

      if (createdOrder && createdOrder.id) {
        navigate(`/orders/${createdOrder.id}`)
      } else {
        setTimeout(() => window.location.reload(), 1000)
      }
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
              <Label>Contrato (Opcional)</Label>
              <Select
                value={formData.contractId || 'none'}
                onValueChange={(v) => {
                  if (v === 'none') {
                    setFormData({ ...formData, contractId: undefined })
                  } else {
                    const contract = contracts?.find((c: any) => c.id === v)
                    setFormData({
                      ...formData,
                      contractId: v,
                      clientId: contract ? contract.clientId : formData.clientId,
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contrato..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum contrato</SelectItem>
                  {contracts?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cliente *</Label>
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
              <Label>Categoria *</Label>
              <Select
                value={formData.service_type || 'preventiva'}
                onValueChange={(v) => setFormData({ ...formData, service_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
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
