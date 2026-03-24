import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { ServiceOrdersRepository } from '@/services/repositories/service-orders.repository'
import { ClientsRepository } from '@/services/repositories/clients.repository'
import { TechniciansRepository } from '@/services/repositories/teams.repository'
import { UsersRepository } from '@/services/repositories/users.repository'

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
  title: string
  client: string
  status: OSStatus
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
  updateOrderStatus: (id: string, status: OSStatus) => void
}

const initialOrders: Order[] = [
  {
    id: 'OS-1042',
    title: 'Manutenção Preventiva Ar Condicionado',
    client: 'Condomínio Alpha',
    status: 'Em Execução',
    priority: 'Média',
    date: '2023-10-25',
    tech: 'Carlos Silva',
    address: 'Av. Paulista, 1000',
    distance: '2.4 km',
  },
]

function mapStatus(s: string): OSStatus {
  switch (s) {
    case 'pending':
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
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useEffect(() => {
    async function loadData() {
      try {
        const dbOrders = await ServiceOrdersRepository.findAll()
        const clients = await ClientsRepository.findAll()
        const techs = await TechniciansRepository.findAll()
        const users = await UsersRepository.findAll()

        const mappedOrders: Order[] = dbOrders.map((o) => {
          const client = clients.find((c) => c.id === o.client_id)?.name || 'Desconhecido'
          const tech = techs.find((t) => t.id === o.technician_id)
          const user = users.find((u) => u.id === tech?.user_id)?.name || 'Não Atribuído'

          return {
            id: o.id.substring(0, 8).toUpperCase(),
            title: o.description || 'Manutenção',
            client,
            status: mapStatus(o.status),
            priority: mapPriority(o.priority),
            date: o.scheduled_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            tech: user,
            address: '123 Business Avenue',
          }
        })

        if (mappedOrders.length > 0) {
          setOrders(mappedOrders)
        }
      } catch (error) {
        console.error('Error loading data from repositories', error)
      }
    }
    loadData()
  }, [])

  const updateOrderStatus = (id: string, status: OSStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  return (
    <AppContext.Provider value={{ role, setRole, orders, updateOrderStatus }}>
      {children}
    </AppContext.Provider>
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within an AppProvider')
  return context
}
