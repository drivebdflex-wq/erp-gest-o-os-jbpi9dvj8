import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, User, Clock, FileText } from 'lucide-react'
import { Order } from '@/stores/useAppStore'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export default function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  if (!order) return null

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
              <div>
                <p className="font-medium text-foreground">Técnico Atribuído</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.tech}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" /> Ver Relatório Completo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
