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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { toast } from '@/hooks/use-toast'
import { Sparkles, UserPlus } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import { checkConflict } from '@/lib/schedule'
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
  defaultTeamId,
  defaultDate,
}: CreateOrderDialogProps) {
  const { clients, contracts, contractUnits, createOrder, priceItems, orders } = useAppStore()
  const { technicians, teams } = useOperationalStore()
  const [formData, setFormData] = useState<any>({ priority: 'Normal (10 dias)' })

  // Schedule States
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>()
  const [scheduleTime, setScheduleTime] = useState<string>('08:00')
  const [duration, setDuration] = useState<number>(60)
  const [suggestedSlots, setSuggestedSlots] = useState<Date[]>([])
  const [showClientDialog, setShowClientDialog] = useState(false)

  useEffect(() => {
    if (open) {
      let initData: any = { priority: 'Normal (10 dias)' }

      if (defaultContractId) {
        const contract = contracts.find((c) => c.id === defaultContractId)
        if (contract) {
          initData = { ...initData, contractId: defaultContractId, clientId: contract.clientId }
        }
      }
      if (defaultTeamId) {
        initData = { ...initData, responsible: `team_${defaultTeamId}`, teamId: defaultTeamId }
      }

      setScheduleDate(defaultDate)
      setScheduleTime('08:00')
      setDuration(60)
      setSuggestedSlots([])
      setFormData(initData)
    }
  }, [open, defaultContractId, defaultTeamId, defaultDate, contracts])

  const availableServices = priceItems.filter((p) => p.contractId === formData.contractId)
  const availableUnits = contractUnits.filter((u) => u.contractId === formData.contractId)

  const handleSuggestSlots = () => {
    if (!scheduleDate) return toast({ title: 'Selecione uma data primeiro' })
    if (!formData.teamId && !formData.technicianId)
      return toast({ title: 'Selecione um responsável' })

    const slots: Date[] = []
    const dayStart = startOfDay(scheduleDate)
    dayStart.setHours(7, 0, 0, 0) // Starts at 07:00

    let current = dayStart.getTime()
    const endOfDayMs = startOfDay(scheduleDate).setHours(18, 0, 0, 0) // Ends at 18:00

    while (current <= endOfDayMs) {
      const slotTime = new Date(current)
      if (
        !checkConflict(orders as any[], formData.teamId, formData.technicianId, slotTime, duration)
      ) {
        slots.push(slotTime)
      }
      current += 30 * 60000 // Increment by 30 mins
    }

    if (slots.length === 0) {
      toast({
        title: 'Sem horários',
        description: 'Nenhum horário disponível nesta data.',
        variant: 'destructive',
      })
    }
    setSuggestedSlots(slots)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setScheduleDate(undefined)
      return
    }
    setScheduleDate(new Date(`${e.target.value}T12:00:00`))
  }

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
      if (!formData.unitId) {
        toast({
          title: 'Aviso',
          description: 'Selecione uma agência / unidade.',
          variant: 'destructive',
        })
        return
      }
      if (!formData.serviceType) {
        toast({
          title: 'Aviso',
          description: 'Selecione uma categoria de serviço.',
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
            description: 'Código de serviço não encontrado.',
            variant: 'destructive',
          })
          return
        }
      }

      let finalScheduledAt: string | undefined = undefined
      if (scheduleDate && scheduleTime) {
        const [h, m] = scheduleTime.split(':').map(Number)
        const d = new Date(scheduleDate)
        d.setHours(h, m, 0, 0)

        if (formData.teamId || formData.technicianId) {
          if (checkConflict(orders as any[], formData.teamId, formData.technicianId, d, duration)) {
            toast({
              title: 'Conflito de Horário',
              description:
                'Responsável indisponível neste horário (conflito ou intervalo insuficiente).',
              variant: 'destructive',
            })
            return
          }
        }
        finalScheduledAt = d.toISOString()
      } else if (scheduleDate) {
        toast({
          title: 'Aviso',
          description: 'Informe o horário de início para o agendamento.',
          variant: 'destructive',
        })
        return
      }

      await createOrder({
        description: formData.description,
        client_id: formData.clientId,
        contract_id: formData.contractId,
        unit_id: formData.unitId,
        technician_id: formData.technicianId,
        team_id: formData.teamId,
        priority: formData.priority as any,
        service_type: formData.serviceType,
        status: finalScheduledAt ? 'scheduled' : 'pending',
        scheduled_at: finalScheduledAt,
        estimated_duration_minutes: duration,
        service_code: formData.serviceCode === 'none' ? undefined : formData.serviceCode,
        service_value: formData.serviceValue,
      })
      toast({ title: 'Sucesso', description: 'OS criada com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
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
                  disabled={!!defaultContractId}
                  value={formData.clientId || undefined}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      clientId: v,
                      contractId: undefined,
                      unitId: undefined,
                    })
                  }
                >
                  <SelectTrigger className="flex-1">
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
                {!defaultContractId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowClientDialog(true)}
                    title="Novo Cliente"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contrato Vinculado</Label>
              <Select
                disabled={!!defaultContractId || !formData.clientId}
                value={formData.contractId || undefined}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    contractId: v,
                    unitId: undefined,
                    serviceCode: undefined,
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

            <div className="space-y-2">
              <Label>Agência / Unidade</Label>
              <Select
                disabled={!formData.contractId || availableUnits.length === 0}
                value={formData.unitId || undefined}
                onValueChange={(v) => setFormData({ ...formData, unitId: v })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.contractId
                        ? 'Selecione o contrato primeiro'
                        : availableUnits.length === 0
                          ? 'Nenhuma agência no contrato'
                          : 'Selecione a agência'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      [{u.prefix}] {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria do Serviço</Label>
              <Select
                value={formData.serviceType || undefined}
                onValueChange={(v) => setFormData({ ...formData, serviceType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria..." />
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

            <div className="space-y-2 md:col-span-2">
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
                          : 'Contrato sem tabela'
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

            <div className="space-y-2 md:col-span-2">
              <Label>Responsável</Label>
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

            {/* Agendamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md bg-muted/20 md:col-span-2">
              <div className="md:col-span-3">
                <Label className="text-primary font-semibold">Agendamento (Opcional)</Label>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={scheduleDate ? format(scheduleDate, 'yyyy-MM-dd') : ''}
                  onChange={handleDateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  disabled={!scheduleDate}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração Estimada</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30m</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="180">3 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scheduleDate && (formData.teamId || formData.technicianId) && (
                <div className="col-span-1 md:col-span-3">
                  <Button type="button" variant="secondary" size="sm" onClick={handleSuggestSlots}>
                    <Sparkles className="w-4 h-4 mr-2" /> Sugerir Horários Livres
                  </Button>
                  {suggestedSlots.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedSlots.slice(0, 10).map((slot) => (
                        <Badge
                          key={slot.toISOString()}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setScheduleTime(format(slot, 'HH:mm'))}
                        >
                          {format(slot, 'HH:mm')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
