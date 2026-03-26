import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { ServiceOrdersService } from '@/services/business/service-orders.service'
import { ClientsRepository } from '@/services/repositories/clients.repository'
import { TechniciansRepository, UsersRepository } from '@/services/repositories/users.repository'
import type { SLAStatus } from '@/services/repositories/types/common'

export type Role = 'admin' | 'tech'
export type OSStatus =
  | 'Rascunho'
  | 'Pendente'
  | 'Agendado'
  | 'Em Deslocamento'
  | 'Em Execução'
  | 'Pausado'
  | 'Em Auditoria'
  | 'Finalizada'
  | 'Rejeitada'
  | 'Cancelada'

export type OSPriority = 'Alta' | 'Média' | 'Baixa'

export interface Order {
  id: string
  shortId: string
  title: string
  client: string
  status: OSStatus
  dbStatus: string
  priority: OSPriority
  date: string
  tech: string
  address: string
  distance?: string
  slaStatus: SLAStatus
  totalDuration: number
  finishedAt?: string
  updatedAt: string
  type: 'Preventiva' | 'Corretiva' | 'Obra'
}

interface AppState {
  role: Role
  setRole: (role: Role) => void
  orders: Order[]
  updateOrderStatus: (id: string, status: OSStatus) => Promise<void>
  createOrder: (data: any) => Promise<void>
  loadOrders: () => Promise<void>
}

function mapStatus(s: string): OSStatus {
  switch (s) {
    case 'draft':
      return 'Rascunho'
    case 'pending':
      return 'Pendente'
    case 'scheduled':
      return 'Agendado'
    case 'deslocamento':
      return 'Em Deslocamento'
    case 'in_progress':
      return 'Em Execução'
    case 'paused':
      return 'Pausado'
    case 'in_audit':
      return 'Em Auditoria'
    case 'completed':
      return 'Finalizada'
    case 'rejected':
      return 'Rejeitada'
    case 'cancelled':
      return 'Cancelada'
    default:
      return 'Pendente'
  }
}

function mapStatusToDb(s: OSStatus): string {
  switch (s) {
    case 'Rascunho':
      return 'draft'
    case 'Pendente':
      return 'pending'
    case 'Agendado':
      return 'scheduled'
    case 'Em Deslocamento':
      return 'deslocamento'
    case 'Em Execução':
      return 'in_progress'
    case 'Pausado':
      return 'paused'
    case 'Em Auditoria':
      return 'in_audit'
    case 'Finalizada':
      return 'completed'
    case 'Rejeitada':
      return 'rejected'
    case 'Cancelada':
      return 'cancelled'
    default:
      return 'pending'
  }
}

function mapPriority(p: string): OSPriority {
  switch (p) {
    case 'high':
    case 'urgent':
      return 'Alta'
    case 'medium':
      return 'Média'
    case 'low':
      return 'Baixa'
    default:
      return 'Média'
  }
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin')
  const [orders, setOrders] = useState<Order[]>([])

  const loadOrders = useCallback(async () => {
    try {
      const dbOrders = await ServiceOrdersService.findAll()
      const clients = await ClientsRepository.findAll()
      const techs = await TechniciansRepository.findAll()
      const users = await UsersRepository.findAll()

      const mappedOrders: Order[] = dbOrders.map((o: any) => {
        const client = clients.find((c) => c.id === o.client_id)?.name || 'Desconhecido'
        const tech = techs.find((t) => t.id === o.technician_id)
        const user = users.find((u) => u.id === tech?.user_id)?.name || 'Não Atribuído'

        const descriptionStr = (o.description || '').toLowerCase()
        const type = descriptionStr.includes('preventiva')
          ? 'Preventiva'
          : descriptionStr.includes('obra')
            ? 'Obra'
            : 'Corretiva'

        return {
          id: o.id,
          shortId: o.id.substring(0, 8).toUpperCase(),
          title: o.description || 'Manutenção',
          client,
          status: mapStatus(o.status),
          dbStatus: o.status,
          priority: mapPriority(o.priority),
          date: o.scheduled_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          tech: user,
          address: '123 Business Avenue',
          slaStatus: o.sla_status || 'within_sla',
          totalDuration: o.total_duration_minutes || 0,
          finishedAt: o.finished_at,
          updatedAt: o.updated_at || o.created_at || new Date().toISOString(),
          type,
        }
      })

      setOrders(mappedOrders)
    } catch (error) {
      console.error('Error loading data from repositories', error)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateOrderStatus = async (id: string, status: OSStatus) => {
    const dbStatus = mapStatusToDb(status) as any
    await ServiceOrdersService.changeStatus(id, dbStatus)
    await loadOrders()
  }

  const createOrder = async (data: any) => {
    await ServiceOrdersService.create(data)
    await loadOrders()
  }

  return (
    <AppContext.Provider
      value={{ role, setRole, orders, updateOrderStatus, createOrder, loadOrders }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within an AppProvider')
  return context
}
