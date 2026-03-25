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

export type Role = 'admin' | 'tech'
export type OSStatus =
  | 'Aberta'
  | 'Planejada'
  | 'Em Execução'
  | 'Pausada'
  | 'Em Auditoria'
  | 'Finalizada'
  | 'Reprovada'
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
    case 'pending':
    case 'draft':
      return 'Aberta'
    case 'scheduled':
      return 'Planejada'
    case 'in_progress':
      return 'Em Execução'
    case 'paused':
      return 'Pausada'
    case 'in_audit':
      return 'Em Auditoria'
    case 'completed':
      return 'Finalizada'
    case 'rejected':
      return 'Reprovada'
    default:
      return 'Aberta'
  }
}

function mapStatusToDb(s: OSStatus): string {
  switch (s) {
    case 'Aberta':
      return 'pending'
    case 'Planejada':
      return 'scheduled'
    case 'Em Execução':
      return 'in_progress'
    case 'Pausada':
      return 'paused'
    case 'Em Auditoria':
      return 'in_audit'
    case 'Finalizada':
      return 'completed'
    case 'Reprovada':
      return 'rejected'
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
      const dbOrders = await ServiceOrdersService.findAll('admin-id')
      const clients = await ClientsRepository.findAll()
      const techs = await TechniciansRepository.findAll()
      const users = await UsersRepository.findAll()

      const mappedOrders: Order[] = dbOrders.map((o: any) => {
        const client = clients.find((c) => c.id === o.client_id)?.name || 'Desconhecido'
        const tech = techs.find((t) => t.id === o.technician_id)
        const user = users.find((u) => u.id === tech?.user_id)?.name || 'Não Atribuído'

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
    await ServiceOrdersService.changeStatus(id, dbStatus, 'admin-id')
    await loadOrders()
  }

  const createOrder = async (data: any) => {
    await ServiceOrdersService.create(data, 'admin-id')
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
