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
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import useAppStore from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { toast } from '@/hooks/use-toast'

export default function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { clients, contracts, createOrder } = useAppStore()
  const { technicians, teams } = useOperationalStore()
  const [formData, setFormData] = useState<any>({ priority: 'Média' })

  const handleSave = async () => {
    try {
      if (!formData.description || !formData.clientId) {
        toast({ title: 'Aviso', description: 'Preencha título e cliente.', variant: 'destructive' })
        return
      }
      if (!formData.technicianId && !formData.teamId) {
        toast({
          title: 'Aviso',
          description: 'Selecione um responsável (Técnico ou Equipe).',
          variant: 'destructive',
        })
        return
      }
      await createOrder({
        description: formData.description,
        client_id: formData.clientId,
        contract_id: formData.contractId,
        technician_id: formData.technicianId,
        team_id: formData.teamId,
        priority:
          formData.priority === 'Média' ? 'medium' : formData.priority === 'Alta' ? 'high' : 'low',
        status: 'pending',
      })
      toast({ title: 'Sucesso', description: 'OS criada com sucesso.' })
      onOpenChange(false)
      setFormData({ priority: 'Média' })
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
            <div className="space-y-2 col-span-2">
              <Label>Responsável (Obrigatório)</Label>
              <Select
                value={formData.responsible || ''}
                onValueChange={(v) => {
                  if (v.startsWith('team_'))
                    setFormData({
                      ...formData,
                      responsible: v,
                      teamId: v.replace('team_', ''),
                      technicianId: undefined,
                    })
                  else
                    setFormData({ ...formData, responsible: v, technicianId: v, teamId: undefined })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um Técnico ou Equipe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Equipes</SelectLabel>
                    {teams
                      .filter((t) => t.active !== false)
                      .map((t) => (
                        <SelectItem key={`team_${t.id}`} value={`team_${t.id}`}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Técnicos</SelectLabel>
                    {technicians
                      .filter((t) => t.status === 'active')
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
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
