import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'

interface Technician {
  id: string
  name: string
}

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onSuccess: () => void
}

export default function EditOrderDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: EditOrderDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [formData, setFormData] = useState({
    description: '',
    status: '',
    priority: 'medium',
    technician_id: '',
    scheduled_at: '',
    deadline_at: '',
    notes: '',
  })

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 16)
  }

  useEffect(() => {
    if (order && open) {
      setFormData({
        description: order.description || '',
        status: order.status || 'pending',
        priority: order.priority || 'medium',
        technician_id: order.technician_id || '',
        scheduled_at: formatDateTime(order.scheduled_at),
        deadline_at: formatDateTime(order.deadline_at),
        notes: order.notes || '',
      })
    }
  }, [order, open])

  useEffect(() => {
    if (open) {
      const fetchTechnicians = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '/api'
          const res = await fetch(`${apiUrl}/technicians`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data)) {
              setTechnicians(data)
            }
          }
        } catch (e) {
          console.error('Failed to fetch technicians', e)
        }
      }
      fetchTechnicians()
    }
  }, [open])

  const handleSave = async () => {
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const payload: any = { ...formData }
      if (payload.scheduled_at) payload.scheduled_at = new Date(payload.scheduled_at).toISOString()
      else payload.scheduled_at = null

      if (payload.deadline_at) payload.deadline_at = new Date(payload.deadline_at).toISOString()
      else payload.deadline_at = null

      if (payload.technician_id === 'none' || payload.technician_id === '') {
        payload.technician_id = null
      }

      const res = await fetch(`${apiUrl}/service-orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Falha ao atualizar OS')

      let updatedData = payload
      try {
        updatedData = await res.json()
      } catch (e) {
        // use payload if response is not json
      }

      // Update local store for immediate UI refresh
      useAppStore.setState((state: any) => ({
        orders:
          state.orders?.map((o: any) => (o.id === order.id ? { ...o, ...updatedData } : o)) || [],
        filteredOrders:
          state.filteredOrders?.map((o: any) =>
            o.id === order.id ? { ...o, ...updatedData } : o,
          ) || [],
      }))

      toast({ title: 'Sucesso', description: 'OS atualizada com sucesso.' })
      onSuccess()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Descrição detalhada do serviço..."
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="pending">Pendente (Sistema)</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="deslocamento">Em Deslocamento</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="Em Execução">Em Execução</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="in_audit">Em Auditoria</SelectItem>
                <SelectItem value="Em Auditoria">Em Auditoria (Sistema)</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="Finalizada">Finalizada</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(val) => setFormData({ ...formData, priority: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="Emergencial (48h)">Emergencial (48h)</SelectItem>
                <SelectItem value="Urgente (4 dias)">Urgente (4 dias)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Técnico</Label>
            {technicians.length > 0 ? (
              <Select
                value={formData.technician_id || 'none'}
                onValueChange={(val) => setFormData({ ...formData, technician_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {technicians.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData.technician_id}
                onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                placeholder="ID do Técnico (opcional)"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Agendado Para</Label>
            <Input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Prazo (Deadline)</Label>
            <Input
              type="datetime-local"
              value={formData.deadline_at}
              onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notas Adicionais</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Notas internas..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
