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
  const [formData, setFormData] = useState({
    client_id: '',
    description: '',
    priority: 'medium',
  })

  useEffect(() => {
    if (order && open) {
      setFormData({
        client_id: order.client_id || '',
        description: order.description || '',
        priority: order.priority || 'medium',
      })
    }
  }, [order, open])

  const handleSave = async () => {
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/service-orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Falha ao atualizar OS')

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Cliente / Unidade ID</Label>
            <Input
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              placeholder="ID do Cliente"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Descrição detalhada do serviço..."
            />
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
              </SelectContent>
            </Select>
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
