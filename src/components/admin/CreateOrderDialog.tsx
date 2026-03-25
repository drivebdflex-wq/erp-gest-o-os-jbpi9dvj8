import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { ClientsRepository } from '@/services/repositories/clients.repository'
import { TechniciansRepository, UsersRepository } from '@/services/repositories/users.repository'

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const { createOrder } = useAppStore()
  const { toast } = useToast()

  const [clients, setClients] = useState<any[]>([])
  const [techs, setTechs] = useState<any[]>([])

  const [clientId, setClientId] = useState('')
  const [techId, setTechId] = useState('none')
  const [priority, setPriority] = useState('medium')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  async function loadData() {
    try {
      const cls = await ClientsRepository.findAll()
      const ts = await TechniciansRepository.findAll()
      const us = await UsersRepository.findAll()

      setClients(cls)
      setTechs(
        ts.map((t) => {
          const u = us.find((user) => user.id === t.user_id)
          return { id: t.id, name: u?.name || 'Desconhecido' }
        }),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !description) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await createOrder({
        client_id: clientId,
        technician_id: techId === 'none' ? null : techId,
        priority: priority,
        description,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        status: 'pending',
      })
      toast({ title: 'Sucesso', description: 'Ordem de serviço criada com sucesso!' })
      onOpenChange(false)

      // Reset form
      setClientId('')
      setTechId('none')
      setPriority('medium')
      setDescription('')
      setScheduledAt('')
    } catch (error: any) {
      toast({ title: 'Erro ao Criar OS', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            <DialogDescription>Crie uma nova OS e atribua a um técnico de campo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
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

            <div className="grid gap-2">
              <Label htmlFor="tech">Técnico Responsável</Label>
              <Select value={techId} onValueChange={setTechId}>
                <SelectTrigger id="tech">
                  <SelectValue placeholder="Sem atribuição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem atribuição (Fila)</SelectItem>
                  {techs.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
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
              <div className="grid gap-2">
                <Label htmlFor="date">Data Agendada</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Descrição do Serviço *</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Manutenção preventiva..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar OS'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
