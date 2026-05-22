import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Edit, Eye, Calendar, UserPlus, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export function useOrderPermissions() {
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user && mounted) {
        supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', data.user.id)
          .then(({ data: rolesData }) => {
            if (mounted) {
              const hasPrivilege = rolesData?.some(
                (ur: any) => ur.roles?.name === 'administrator' || ur.roles?.name === 'supervisor',
              )
              setCanDelete(!!hasPrivilege)
            }
          })
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  return { canDelete }
}

interface OrderContextMenuProps {
  order: any
  technicians?: any[]
  onUpdateOrder?: (id: string, updates: any) => void
  children: React.ReactNode
}

export function OrderContextMenu({
  order,
  technicians,
  onUpdateOrder,
  children,
}: OrderContextMenuProps) {
  const navigate = useNavigate()
  const { canDelete } = useOrderPermissions()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isTechDialogOpen, setIsTechDialogOpen] = useState(false)

  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newTechId, setNewTechId] = useState(order.technician_id || '')

  const [localTechs, setLocalTechs] = useState<any[]>(technicians || [])

  useEffect(() => {
    if (!technicians || technicians.length === 0) {
      supabase
        .from('technicians')
        .select('id, users(name)')
        .then(({ data }) => {
          if (data) setLocalTechs(data)
        })
    } else {
      setLocalTechs(technicians)
    }
  }, [technicians])

  useEffect(() => {
    if (order.scheduled_at) {
      const d = new Date(order.scheduled_at)
      // Format to local YYYY-MM-DD
      const offset = d.getTimezoneOffset()
      const localDate = new Date(d.getTime() - offset * 60 * 1000)
      setNewDate(localDate.toISOString().split('T')[0])

      const hours = d.getHours().toString().padStart(2, '0')
      const mins = d.getMinutes().toString().padStart(2, '0')
      setNewTime(`${hours}:${mins}`)
    }
    setNewTechId(order.technician_id || '')
  }, [order, isRescheduleDialogOpen, isTechDialogOpen])

  const doUpdate = async (updates: any) => {
    if (onUpdateOrder) {
      onUpdateOrder(order.id, updates)
    } else {
      const { error } = await supabase.from('service_orders').update(updates).eq('id', order.id)
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Atualizado com sucesso' })
      }
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('service_orders').delete().eq('id', order.id)
    if (error) {
      toast({ title: 'Erro ao excluir OS', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'OS excluída com sucesso' })
    }
    setIsDeleteDialogOpen(false)
  }

  const handleRemoveFromAgenda = () => {
    doUpdate({ technician_id: null, scheduled_at: null, status: 'pending' })
  }

  const handleReschedule = () => {
    if (!newDate || !newTime) return
    const dt = new Date(`${newDate}T${newTime}:00`)
    doUpdate({ scheduled_at: dt.toISOString(), status: 'scheduled' })
    setIsRescheduleDialogOpen(false)
  }

  const handleChangeTech = () => {
    if (!newTechId) return
    doUpdate({ technician_id: newTechId })
    setIsTechDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => navigate(`/ordens/${order.id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            Abrir OS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/ordens/${order.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsRescheduleDialogOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Reagendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsTechDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Trocar técnico
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemoveFromAgenda}>
            <XCircle className="w-4 h-4 mr-2" />
            Remover da agenda
          </DropdownMenuItem>

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir OS
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir OS</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir esta Ordem de Serviço?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Reagendar OS</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Trocar Técnico</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Selecione o técnico</Label>
              <Select value={newTechId} onValueChange={setNewTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  {localTechs.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.users?.name || 'Técnico sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTechDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeTech}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
