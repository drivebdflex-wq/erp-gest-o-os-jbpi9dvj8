import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import useOperationalStore from '@/stores/useOperationalStore'

interface AssignOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onSuccess: () => void
}

export default function AssignOrderDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: AssignOrderDialogProps) {
  const { toast } = useToast()
  const { technicians } = useOperationalStore()
  const [loading, setLoading] = useState(false)
  const [techId, setTechId] = useState('')

  const handleAssign = async () => {
    if (!techId) {
      toast({ title: 'Aviso', description: 'Selecione um técnico.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/service-orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'scheduled', technician_id: techId }),
      })

      if (!res.ok) throw new Error('Falha ao atribuir técnico')

      toast({ title: 'Sucesso', description: 'OS atribuída e agendada com sucesso.' })
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
          <DialogTitle>Atribuir Técnico</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Técnico Responsável</Label>
            <Select value={techId} onValueChange={setTechId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {technicians
                  .filter((t: any) => t.status === 'active')
                  .map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
