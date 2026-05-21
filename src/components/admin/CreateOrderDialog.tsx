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
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultContractId?: string
  fixedClientId?: string
  defaultPriority?: string
}

export default function CreateOrderDialog({
  open,
  onOpenChange,
  defaultContractId,
  fixedClientId,
  defaultPriority,
}: CreateOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [contracts, setContracts] = useState<any[]>([])

  const [formData, setFormData] = useState<any>({
    service_order_number: '',
    priority: defaultPriority || 'medium',
    status: 'pending',
    description: '',
    contract_id: defaultContractId || '',
    client_id: fixedClientId || '',
    unit_id: '',
  })

  const [clients, setClients] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      setFormData({
        priority: defaultPriority || 'medium',
        status: 'pending',
        description: '',
        contract_id: defaultContractId || '',
        client_id: fixedClientId || '',
        unit_id: '',
      })

      // Fetch Clients
      supabase
        .from('clients')
        .select('id, name')
        .then(({ data }) => {
          if (data) setClients(data)
        })

      if (!defaultContractId) {
        supabase
          .from('contracts')
          .select('id, contract_number, client_id, sla_description, clients(name)')
          .then(({ data }) => {
            if (data) setContracts(data)
          })
      } else {
        // Fetch contract details to inherit default properties
        supabase
          .from('contracts')
          .select('id, client_id, sla_description')
          .eq('id', defaultContractId)
          .single()
          .then(({ data }) => {
            if (data && !defaultPriority) {
              const inheritedPriority = data.sla_description?.toLowerCase().includes('alta')
                ? 'high'
                : 'medium'
              setFormData((prev) => ({
                ...prev,
                priority: inheritedPriority,
                client_id: data.client_id,
              }))
            }
          })
      }
    }
  }, [open, defaultContractId, fixedClientId, defaultPriority])

  useEffect(() => {
    if (formData.client_id) {
      supabase
        .from('units')
        .select('id, name')
        .eq('client_id', formData.client_id)
        .then(({ data }) => {
          if (data) setUnits(data)
        })
      if (!defaultContractId) {
        supabase
          .from('contracts')
          .select('id, contract_number, client_id')
          .eq('client_id', formData.client_id)
          .then(({ data }) => {
            if (data) setContracts(data)
          })
      }
    } else {
      setUnits([])
    }
  }, [formData.client_id, defaultContractId])

  const handleSave = async () => {
    if (!formData.service_order_number) {
      toast({
        title: 'Aviso',
        description: 'Número da O.S. é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.description) {
      toast({ title: 'Aviso', description: 'Preencha a descrição.', variant: 'destructive' })
      return
    }
    if (!formData.contract_id) {
      toast({
        title: 'Aviso',
        description: 'A seleção de um contrato é obrigatória.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('service_orders')
        .select('id')
        .eq('service_order_number', formData.service_order_number)
        .maybeSingle()

      if (existing) {
        toast({
          title: 'Aviso',
          description: 'Este Número de O.S. já está em uso.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const { error } = await supabase.from('service_orders').insert([
        {
          service_order_number: formData.service_order_number,
          contract_id: formData.contract_id,
          client_id: formData.client_id,
          unit_id: formData.unit_id || null,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
        },
      ])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este Número de O.S. já está em uso (duplicado).')
        }
        throw error
      }

      toast({ title: 'Sucesso', description: 'OS criada com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Número da O.S. *</Label>
            <Input
              placeholder="Ex: OS-2023-001"
              value={formData.service_order_number}
              onChange={(e) => setFormData({ ...formData, service_order_number: e.target.value })}
              className="font-bold font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição / Solicitação *</Label>
            <Textarea
              placeholder="Descreva o problema..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!fixedClientId && !defaultContractId && (
              <div className="space-y-2 col-span-2">
                <Label>Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, client_id: v, unit_id: '', contract_id: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
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
            )}

            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Unidade</Label>
              <Select
                value={formData.unit_id}
                onValueChange={(v) => setFormData({ ...formData, unit_id: v })}
                disabled={!formData.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label>Contrato Vinculado *</Label>
              {defaultContractId ? (
                <Input disabled value="Contrato pré-selecionado pelo contexto" />
              ) : (
                <Select
                  value={formData.contract_id}
                  onValueChange={(v) => {
                    const c = contracts.find((x) => x.id === v)
                    const inheritedPriority = c?.sla_description?.toLowerCase().includes('alta')
                      ? 'high'
                      : 'medium'
                    setFormData({
                      ...formData,
                      contract_id: v,
                      priority: inheritedPriority,
                    })
                  }}
                  disabled={!formData.client_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.contract_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prioridade Herdada/Definida</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Status Inicial</Label>
              <Input disabled value="Pendente" />
            </div>
          </div>

          {defaultContractId && (
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              Esta OS está sendo vinculada automaticamente ao contrato atual, mantendo a integridade
              dos dados e SLA.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Criar OS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
