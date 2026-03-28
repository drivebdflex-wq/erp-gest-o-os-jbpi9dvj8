import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, User, Clock, FileText, History, Trash2, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'
import useAppStore, { Order, SERVICE_TYPE_COLORS, SERVICE_TYPE_LABELS } from '@/stores/useAppStore'
import useOperationalStore from '@/stores/useOperationalStore'
import { AuditsRepository } from '@/services/repositories/auxiliary.repository'
import { cn } from '@/lib/utils'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export default function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  // @ts-expect-error
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const { technicians, teams } = useOperationalStore()
  const { updateOrder } = useAppStore()
  const [audits, setAudits] = useState<any[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  useEffect(() => {
    if (open && order) {
      AuditsRepository.findAll().then((res) => {
        setAudits(
          res
            .filter((a) => a.record_id === order.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        )
      })
    }
  }, [open, order])

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

  const handleDelete = async () => {
    if (!order) return
    setIsDeleting(true)
    try {
      useAppStore.setState((state: any) => ({
        orders: state.orders.filter((o: any) => o.id !== order.id),
        filteredOrders: state.filteredOrders.filter((o: any) => o.id !== order.id),
      }))
      toast({ title: 'Sucesso', description: 'Ordem de Serviço excluída com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Falha ao excluir OS.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  const formatAuditAction = (audit: any) => {
    if (audit.action === 'CREATE') return 'Ordem de Serviço Criada'
    if (audit.action === 'UPDATE') {
      if (audit.new_value?.status && audit.old_value?.status !== audit.new_value?.status) {
        return `Status alterado de ${audit.old_value?.status || 'desconhecido'} para ${audit.new_value.status}`
      }
      if (
        audit.new_value?.technician_id &&
        audit.old_value?.technician_id !== audit.new_value?.technician_id
      ) {
        return 'Técnico responsável reatribuído'
      }
      if (audit.new_value?.team_id && audit.old_value?.team_id !== audit.new_value?.team_id) {
        return 'Equipe responsável reatribuída'
      }
      return 'Dados da Ordem Atualizados'
    }
    return audit.action
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold tracking-tight">
                OS {order.shortId}
              </DialogTitle>
              <Badge
                variant="outline"
                className={cn('border shadow-sm', SERVICE_TYPE_COLORS[order.serviceType])}
              >
                {SERVICE_TYPE_LABELS[order.serviceType]}
              </Badge>
            </div>
            <Badge variant={order.priority === 'Alta' ? 'destructive' : 'secondary'}>
              {order.priority}
            </Badge>
          </div>
          <DialogDescription className="text-base text-foreground mt-2 font-medium">
            {order.title}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full py-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Detalhes e Edição</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" /> Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 outline-none">
            <div className="grid grid-cols-2 gap-4">
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
                    <p className="font-medium text-foreground mb-1">Responsável</p>
                    <Select
                      value={
                        order.technicianId || (order.teamId ? `team_${order.teamId}` : undefined)
                      }
                      onValueChange={handleResponsibleChange}
                    >
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue placeholder="Não atribuído" />
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
            </div>
          </TabsContent>

          <TabsContent value="history" className="outline-none">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 pb-2">
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="border-l-2 border-primary pl-4 py-2 bg-secondary/10 rounded-r-md"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(audit.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {formatAuditAction(audit)}
                  </div>
                </div>
              ))}
              {audits.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Nenhum histórico de eventos encontrado.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-between mt-4 border-t pt-4 border-border/50">
          <div>
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" /> Ver Relatório
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a OS <strong>{order?.shortId}</strong>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
