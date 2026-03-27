import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, User, Clock, FileText } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useAppStore, { Order } from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export default function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  const { technicians, teams } = useOperationalStore()
  const { updateOrder } = useAppStore()

  if (!order) return null

  const handleResponsibleChange = async (val: string) => {
    try {
      if (val.startsWith('team_')) {
        await updateOrder(order.id, { team_id: val.replace('team_', ''), technician_id: null })
      } else {
        await updateOrder(order.id, { technician_id: val, team_id: null })
      }
      toast({ title: 'Sucesso', description: 'Responsável atualizado com sucesso.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between mt-2">
            <DialogTitle className="text-xl font-bold tracking-tight">
              OS {order.shortId}
            </DialogTitle>
            <Badge variant={order.priority === 'Alta' ? 'destructive' : 'secondary'}>
              {order.priority}
            </Badge>
          </div>
          <DialogDescription className="text-base text-foreground mt-2 font-medium">
            {order.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-start gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{order.client}</p>
                <p className="text-xs text-primary font-medium mt-0.5">
                  {order.contractName || 'Sem Contrato Vinculado'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm mt-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{order.unit}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Status: {order.status}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Atualizado em {new Date(order.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm mt-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <p className="font-medium text-foreground">Responsável</p>
                <Select
                  value={order.technicianId || (order.teamId ? `team_${order.teamId}` : '')}
                  onValueChange={handleResponsibleChange}
                >
                  <SelectTrigger className="h-8 text-xs mt-1 w-full">
                    <SelectValue placeholder="Não atribuído" />
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
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" /> Ver Relatório
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
