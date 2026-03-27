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

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultContractId?: string
}

export default function CreateOrderDialog({
  open,
  onOpenChange,
  defaultContractId,
}: CreateOrderDialogProps) {
  const { clients, contracts, createOrder, priceItems } = useAppStore()
  const { technicians, teams } = useOperationalStore()
  const [formData, setFormData] = useState<any>({ priority: 'Média' })

  useEffect(() => {
    if (open) {
      if (defaultContractId) {
        const contract = contracts.find((c) => c.id === defaultContractId)
        if (contract) {
          setFormData({
            priority: 'Média',
            contractId: defaultContractId,
            clientId: contract.clientId,
          })
        }
      } else {
        setFormData({ priority: 'Média' })
      }
    }
  }, [open, defaultContractId, contracts])

  const availableServices = priceItems.filter((p) => p.contractId === formData.contractId)

  const handleSave = async () => {
    try {
      if (!formData.description || !formData.clientId || !formData.contractId) {
        toast({
          title: 'Aviso',
          description: 'Preencha título, cliente e associe a um contrato.',
          variant: 'destructive',
        })
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

      if (formData.serviceCode && formData.serviceCode !== 'none') {
        const exists = priceItems.some(
          (p) => p.contractId === formData.contractId && p.serviceCode === formData.serviceCode,
        )
        if (!exists) {
          toast({
            title: 'Erro de Validação',
            description: 'Código de serviço não encontrado na tabela de preços do contrato.',
            variant: 'destructive',
          })
          return
        }
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
        service_code: formData.serviceCode === 'none' ? undefined : formData.serviceCode,
        service_value: formData.serviceValue,
      })
      toast({ title: 'Sucesso', description: 'OS criada com sucesso e vinculada ao contrato.' })
      onOpenChange(false)
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
                disabled={!!defaultContractId}
                value={formData.clientId || undefined}
                onValueChange={(v) =>
                  setFormData({ ...formData, clientId: v, contractId: undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    .filter((c) => c.id && c.id.trim() !== '')
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name || 'Sem Nome'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contrato Vinculado (Obrigatório)</Label>
              <Select
                disabled={!!defaultContractId || !formData.clientId}
                value={formData.contractId || undefined}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    contractId: v,
                    serviceCode: undefined,
                    serviceValue: undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato" />
                </SelectTrigger>
                <SelectContent>
                  {contracts
                    .filter((c) => c.clientId === formData.clientId && c.id && c.id.trim() !== '')
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name || 'Sem Nome'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Serviço (Tabela de Preços)</Label>
              <Select
                disabled={!formData.contractId || availableServices.length === 0}
                value={formData.serviceCode || 'none'}
                onValueChange={(v) => {
                  if (v === 'none') {
                    setFormData({ ...formData, serviceCode: undefined, serviceValue: undefined })
                  } else {
                    const item = availableServices.find((s) => s.serviceCode === v)
                    setFormData({ ...formData, serviceCode: v, serviceValue: item?.unitPrice })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.contractId
                        ? 'Selecione um contrato primeiro'
                        : availableServices.length
                          ? 'Selecione um serviço...'
                          : 'Contrato sem tabela de preços'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Serviço Avulso / Não tabelado</SelectItem>
                  {availableServices
                    .filter((s) => s.serviceCode && s.serviceCode.trim() !== '')
                    .map((s) => (
                      <SelectItem key={s.serviceCode} value={s.serviceCode}>
                        {s.serviceCode} - {s.serviceName || 'Sem Nome'} (R$ {s.unitPrice.toFixed(2)}
                        )
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Responsável (Obrigatório)</Label>
              <Select
                value={formData.responsible || undefined}
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
                      .filter((t) => t.active !== false && t.id && t.id.trim() !== '')
                      .map((t) => (
                        <SelectItem key={`team_${t.id}`} value={`team_${t.id}`}>
                          {t.name || 'Sem Nome'}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Técnicos</SelectLabel>
                    {technicians
                      .filter((t) => t.status === 'active' && t.id && t.id.trim() !== '')
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name || 'Sem Nome'}
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
