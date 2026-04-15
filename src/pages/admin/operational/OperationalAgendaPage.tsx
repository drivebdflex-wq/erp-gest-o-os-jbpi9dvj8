import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  ChevronDown,
  Truck,
  MapPin,
  Wrench,
  AlertCircle,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
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
import { Trash2, Loader2 } from 'lucide-react'
// @ts-expect-error
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

interface ServiceOrder {
  id: string
  client_id: string
  unit_id: string
  technician_id?: string
  status: string
  priority?: string
  service_type?: string
  description?: string
  scheduled_at?: string
  client_name?: string
}

const START_HOUR = 7
const END_HOUR = 19
const HOURS_COUNT = END_HOUR - START_HOUR
const HOUR_HEIGHT = 90

export default function OperationalAgendaPage() {
  // @ts-expect-error
  const user = useAuthStore?.((state: any) => state.user)
  const isAdmin =
    user?.role === 'admin' || user?.role === 'Administrator' || user?.role === 'admin_master'

  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date())
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${apiUrl}/service-orders?status=scheduled`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.filter((o: any) => !o.deleted_at && !o.deletedAt))
      } else {
        toast({ title: 'Erro ao buscar ordens', variant: 'destructive' })
      }
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro de conexão', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const handleOrderUpdated = () => fetchOrders()
    const handleOrderDeleted = () => fetchOrders()
    window.addEventListener('service-order-updated', handleOrderUpdated)
    window.addEventListener('service-order-deleted', handleOrderDeleted)
    return () => {
      window.removeEventListener('service-order-updated', handleOrderUpdated)
      window.removeEventListener('service-order-deleted', handleOrderDeleted)
    }
  }, [])

  const handleDeleteOrder = async (id: string) => {
    setIsDeleting(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const res = await fetch(`${apiUrl}/service-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Error deleting record. Please try again.')
      }

      setOrders((prev) => prev.filter((o) => o.id !== id))
      window.dispatchEvent(new Event('service-order-deleted'))
      toast({ title: 'Sucesso', description: 'Service Order deleted successfully.' })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir OS',
        description: error.message || 'Falha ao excluir.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setOrderToDelete(null)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${apiUrl}/service-orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast({ title: 'Status atualizado com sucesso' })
        window.dispatchEvent(new Event('service-order-updated'))
        // Optimistically remove from view if it's no longer scheduled
        if (newStatus !== 'scheduled') {
          setOrders((prev) => prev.filter((o) => o.id !== id))
        } else {
          fetchOrders()
        }
      } else {
        const err = await response.json()
        toast({
          title: 'Erro ao atualizar status',
          description: err.message || 'Verifique as transições de status permitidas.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({ title: 'Erro de conexão', variant: 'destructive' })
    }
  }

  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: HOURS_COUNT }).map((_, i) => START_HOUR + i)

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-card p-4 rounded-lg border shadow-sm gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Agenda & Escala</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciamento de ordens de serviço agendadas
          </p>
        </div>

        <Alert className="w-auto bg-amber-500/10 text-amber-600 border-amber-500/20 py-3 flex items-start sm:items-center">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          <div>
            <AlertTitle className="text-sm font-semibold mb-1">Aviso de Volatilidade</AlertTitle>
            <AlertDescription className="text-xs">
              Nenhum banco de dados conectado. Os dados persistem apenas em memória e serão perdidos
              ao reiniciar o servidor.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      <div className="flex-1 rounded-lg border bg-card flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, -7))}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, 7))}>
              Próxima
            </Button>
          </div>
          <div className="font-semibold text-sm capitalize">
            {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} -{' '}
            {format(addDays(weekStart, 6), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Carregando agenda...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-muted/5">
            <CalendarIcon className="w-16 h-16 mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              Nenhuma ordem de serviço agendada encontrada
            </h3>
            <p className="text-sm text-center max-w-md">
              Não há ordens de serviço com status "scheduled" para serem exibidas na agenda no
              momento.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-auto custom-scrollbar relative">
            <div className="flex sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b shrink-0">
              <div className="w-16 shrink-0 border-r" />
              {days.map((d) => (
                <div
                  key={d.toISOString()}
                  className={cn(
                    'flex-1 min-w-[160px] p-2 text-center border-r font-semibold text-sm capitalize truncate transition-colors',
                    isSameDay(d, new Date()) && 'text-primary bg-primary/5',
                  )}
                >
                  {format(d, 'EEEE, dd/MM', { locale: ptBR })}
                </div>
              ))}
            </div>
            <div className="flex relative min-w-max w-full bg-background">
              <div
                className="w-16 shrink-0 border-r bg-muted/5 sticky left-0 z-10"
                style={{ height: HOURS_COUNT * HOUR_HEIGHT }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="w-full text-right pr-2 text-xs font-medium text-muted-foreground"
                    style={{ height: HOUR_HEIGHT, paddingTop: 8 }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {days.map((d) => {
                const dayOrders = orders.filter(
                  (o) => o.scheduled_at && isSameDay(new Date(o.scheduled_at), d),
                )

                return (
                  <div
                    key={d.toISOString()}
                    className="flex-1 min-w-[160px] border-r relative group/col hover:bg-muted/5 transition-colors"
                    style={{ height: HOURS_COUNT * HOUR_HEIGHT }}
                  >
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="absolute w-full border-t border-border/40 pointer-events-none"
                        style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      />
                    ))}

                    {dayOrders.map((o) => {
                      const oDate = new Date(o.scheduled_at!)
                      const startMins = oDate.getHours() * 60 + oDate.getMinutes()
                      const top = ((startMins - START_HOUR * 60) / 60) * HOUR_HEIGHT
                      const duration = 90 // Visual default height
                      const height = (duration / 60) * HOUR_HEIGHT

                      return (
                        <div
                          key={o.id}
                          className="absolute left-1.5 right-1.5 rounded-md border shadow-sm bg-blue-500/10 border-blue-500/30 p-2.5 flex flex-col gap-1.5 z-10 overflow-hidden hover:shadow-md hover:border-blue-500/50 transition-all group/card"
                          style={{ top, height: Math.max(height, 70) }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded truncate">
                              OS-{o.id.substring(0, 8).toUpperCase()}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0 -mr-1 -mt-1 hover:bg-blue-500/20"
                                >
                                  <ChevronDown className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                  Atualizar Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(o.id, 'in_progress')}
                                  className="cursor-pointer"
                                >
                                  <Truck className="w-4 h-4 mr-2 text-orange-500" /> Iniciar
                                  Execução
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(o.id, 'pending')}
                                  className="cursor-pointer"
                                >
                                  <Clock className="w-4 h-4 mr-2 text-blue-500" /> Retornar p/
                                  Pendente
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(o.id, 'completed')}
                                  className="cursor-pointer text-green-600 focus:text-green-600"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" /> Concluir OS
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(o.id, 'cancelled')}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" /> Cancelar OS
                                </DropdownMenuItem>
                                {isAdmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setOrderToDelete(o.id)}
                                      className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Excluir OS
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex flex-col gap-1 mt-1">
                            <div
                              className="text-[11px] font-medium leading-tight truncate flex items-center gap-1.5"
                              title={o.client_name || o.client_id}
                            >
                              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                              {o.client_name || o.client_id.substring(0, 12)}
                            </div>
                            <div
                              className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5"
                              title={o.service_type}
                            >
                              <Wrench className="w-3 h-3 shrink-0" />
                              {o.service_type || 'Serviço Geral'}
                            </div>
                          </div>

                          <div className="mt-auto text-[10px] font-semibold flex items-center gap-1.5 text-blue-700/80 dark:text-blue-400/80 pt-1">
                            <Clock className="w-3 h-3" /> {format(oDate, 'HH:mm')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir esta OS? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (orderToDelete) handleDeleteOrder(orderToDelete)
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
    </div>
  )
}
