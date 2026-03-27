import { useState } from 'react'
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
import useFleetStore from '@/stores/useFleetStore'
import { toast } from '@/hooks/use-toast'

export default function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { clients, contracts, createOrder } = useAppStore()
  const { vehicles } = useFleetStore()
  const [formData, setFormData] = useState<any>({ priority: 'Média', status: 'Pendente' })

  const handleSave = async () => {
    try {
      if (!formData.description || !formData.clientId) {
        toast({ title: 'Aviso', description: 'Preencha título e cliente.', variant: 'destructive' })
        return
      }
      await createOrder({
        description: formData.description,
        client_id: formData.clientId,
        contract_id: formData.contractId,
        vehicle_id: formData.vehicleId,
        priority:
          formData.priority === 'Média' ? 'medium' : formData.priority === 'Alta' ? 'high' : 'low',
      })
      toast({ title: 'Sucesso', description: 'OS criada com sucesso.' })
      onOpenChange(false)
      setFormData({ priority: 'Média', status: 'Pendente' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.clientId || ''}
                onValueChange={(v) =>
                  setFormData({ ...formData, clientId: v, contractId: undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contrato Vinculado</Label>
              <Select
                disabled={!formData.clientId}
                value={formData.contractId || 'none'}
                onValueChange={(v) =>
                  setFormData({ ...formData, contractId: v === 'none' ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Avulso / Sem Contrato</SelectItem>
                  {contracts
                    .filter((c) => c.clientId === formData.clientId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={formData.priority || 'Média'}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Veículo (Opcional)</Label>
              <Select
                value={formData.vehicleId || 'none'}
                onValueChange={(v) =>
                  setFormData({ ...formData, vehicleId: v === 'none' ? undefined : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} - {v.model}
                    </SelectItem>
                  ))}
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
    </Dialog>
  )
}
