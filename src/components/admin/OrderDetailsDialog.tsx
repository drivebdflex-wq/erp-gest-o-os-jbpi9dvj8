import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Order } from '@/stores/useAppStore'
import { MapPin, User, Clock, AlertCircle } from 'lucide-react'

interface OrderDetailsDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-start pr-4">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                OS {order.shortId}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base text-foreground font-medium">
                {order.title}
              </DialogDescription>
            </div>
            <Badge
              variant={order.status === 'Em Execução' ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {order.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4 mt-2 border-t">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5" /> Cliente
              </p>
              <p className="font-medium text-sm">{order.client}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" /> Endereço
              </p>
              <p className="font-medium text-sm">{order.address}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5" /> Técnico Responsável
              </p>
              <p className="font-medium text-sm">{order.tech}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Prioridade
                </p>
                <Badge variant={order.priority === 'Alta' ? 'destructive' : 'outline'}>
                  {order.priority}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5" /> Agendamento
                </p>
                <p className="font-medium text-sm">{order.date}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
