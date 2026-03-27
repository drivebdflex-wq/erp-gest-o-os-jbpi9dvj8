import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { ServiceOrdersService } from '@/services/business/service-orders.service'
import { ClientsRepository } from '@/services/repositories/clients.repository'
import { TechniciansRepository, UsersRepository } from '@/services/repositories/users.repository'
import { ContractsRepository } from '@/services/repositories/contracts.repository'
import { ContractPriceItemsRepository } from '@/services/repositories/contract-price-items.repository'
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

export type OSServiceType =
  | 'eletrica'
  | 'hidraulica'
  | 'civil'
  | 'serralheria'
  | 'marmoraria'
  | 'marcenaria'

const STATUS_MAP: Record<string, OSStatus> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  scheduled: 'Agendado',
  deslocamento: 'Em Deslocamento',
  in_progress: 'Em Execução',
  paused: 'Pausado',
  in_audit: 'Em Auditoria',
  completed: 'Finalizada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
}

const DB_STATUS_MAP: Record<OSStatus, string> = {
  Rascunho: 'draft',
  Pendente: 'pending',
  Agendado: 'scheduled',
  'Em Deslocamento': 'deslocamento',
  'Em Execução': 'in_progress',
  Pausado: 'paused',
  'Em Auditoria': 'in_audit',
  Finalizada: 'completed',
  Rejeitada: 'rejected',
  Cancelada: 'cancelled',
}

const PRIORITY_MAP: Record<string, OSPriority> = {
  high: 'Alta',
  urgent: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export const SERVICE_TYPE_LABELS: Record<OSServiceType, string> = {
  eletrica: 'Elétrica',
  hidraulica: 'Hidráulica',
  civil: 'Civil',
  serralheria: 'Serralheria',
  marmoraria: 'Marmoraria',
  marcenaria: 'Marcenaria',
}

export const SERVICE_TYPE_COLORS: Record<OSServiceType, string> = {
  eletrica:
    'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-700',
  hidraulica:
    'bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700',
  civil:
    'bg-green-100 text-green-800 border-green-400 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700',
  serralheria:
    'bg-slate-100 text-slate-800 border-slate-400 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-600',
  marmoraria:
    'bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-700',
  marcenaria:
    'bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-700',
}

export const KANBAN_BORDER_COLORS: Record<OSServiceType, string> = {
  eletrica: 'border-t-yellow-500 dark:border-t-yellow-500',
  hidraulica: 'border-t-blue-500 dark:border-t-blue-500',
  civil: 'border-t-green-500 dark:border-t-green-500',
  serralheria: 'border-t-slate-500 dark:border-t-slate-500',
  marmoraria: 'border-t-purple-500 dark:border-t-purple-500',
  marcenaria: 'border-t-orange-500 dark:border-t-orange-500',
}

export interface Contract {
  id: string
  name: string
  clientId: string
  clientName: string
  location: string
  type: 'Manutenção' | 'Obra'
  contractNumber: string
  startDate: string
  endDate: string
  value?: number
  hasPreventive?: boolean
  preventiveFrequency?: string
}

export interface PriceItem {
  id: string
  contractId: string
  serviceCode: string
  serviceName: string
  unitPrice: number
}

export interface Order {
  id: string
  shortId: string
  title: string
  client: string
  contractId?: string
  contractName?: string
  vehicleId?: string
  status: OSStatus
  dbStatus: string
  priority: OSPriority
  serviceType: OSServiceType
  date: string
  scheduledAt: string
  tech: string
  technicianId?: string
  teamId?: string
  address: string
  unit: string
  slaStatus: SLAStatus
  totalDuration: number
  estimatedDuration: number
  laborCost: number
  serviceCode?: string
  serviceValue?: number
  finishedAt?: string
  updatedAt: string
  type: 'Preventiva' | 'Corretiva' | 'Obra'
}

interface AppState {
  role: Role
  setRole: (role: Role) => void
  orders: Order[]
  filteredOrders: Order[]
  clients: { id: string; name: string }[]
  contracts: Contract[]
  priceItems: PriceItem[]
  filters: { client: string; unit: string; type: string; period: string; contract: string }
  setDashboardFilter: (key: string, value: string) => void
  updateOrderStatus: (id: string, status: OSStatus) => Promise<void>
  updateOrder: (id: string, data: any) => Promise<void>
  createOrder: (data: any) => Promise<void>
  saveContract: (data: any) => Promise<void>
  loadOrders: () => Promise<void>
  generatePreventives: (contractId: string) => Promise<void>
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin')
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [priceItems, setPriceItems] = useState<PriceItem[]>([])
  const [filters, setFilters] = useState({
    client: 'all',
    unit: 'all',
    type: 'all',
    period: 'all',
    contract: 'all',
  })

  const setDashboardFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      const dbOrders = await ServiceOrdersService.findAll()
      const dbClients = await ClientsRepository.findAll()
      const techs = await TechniciansRepository.findAll()
      const users = await UsersRepository.findAll()
      const dbContracts = await ContractsRepository.findAll()
      const dbPriceItems = await ContractPriceItemsRepository.findAll()

      setClients(dbClients.map((c) => ({ id: c.id, name: c.name })))

      setPriceItems(
        dbPriceItems.map((p) => ({
          id: p.id,
          contractId: p.contract_id,
          serviceCode: p.service_code,
          serviceName: p.service_name,
          unitPrice: Number(p.unit_price) || 0,
        })),
      )

      const mappedContracts: Contract[] = dbContracts.map((c) => ({
        id: c.id,
        clientId: c.client_id,
        clientName: dbClients.find((cl) => cl.id === c.client_id)?.name || 'Desconhecido',
        name: c.name,
        type: c.type as 'Manutenção' | 'Obra',
        contractNumber: c.contract_number,
        location: c.location,
        startDate: c.start_date,
        endDate: c.end_date,
        value: c.value,
        hasPreventive: c.has_preventive,
        preventiveFrequency: c.preventive_frequency,
      }))
      setContracts(mappedContracts)

      const mappedOrders: Order[] = dbOrders.map((o: any) => {
        const client = dbClients.find((c) => c.id === o.client_id)?.name || 'Desconhecido'
        const tech = techs.find((t) => t.id === o.technician_id)
        const user =
          users.find((u) => u.id === tech?.user_id)?.name || tech?.name || 'Não Atribuído'
        const contract = mappedContracts.find((c) => c.id === o.contract_id)
        const descriptionStr = (o.description || '').toLowerCase()
        const type = descriptionStr.includes('preventiva')
          ? 'Preventiva'
          : descriptionStr.includes('obra')
            ? 'Obra'
            : 'Corretiva'
        const units = ['Matriz', 'Filial Sul', 'Filial Norte']
        const unit = units[o.id.charCodeAt(0) % units.length] || 'Matriz'

        return {
          id: o.id,
          shortId: o.id.substring(0, 8).toUpperCase(),
          title: o.description || 'Manutenção',
          client,
          contractId: contract?.id,
          contractName: contract?.name,
          vehicleId: o.vehicle_id,
          status: STATUS_MAP[o.status] || 'Pendente',
          dbStatus: o.status,
          priority: PRIORITY_MAP[o.priority] || 'Média',
          serviceType: o.service_type || 'civil',
          date: o.scheduled_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          scheduledAt: o.scheduled_at || new Date().toISOString(),
          tech: user,
          technicianId: o.technician_id,
          teamId: o.team_id,
          address: '123 Business Avenue',
          unit,
          slaStatus: o.sla_status || 'within_sla',
          totalDuration: o.total_duration_minutes || 0,
          estimatedDuration: o.estimated_duration_minutes || 60,
          laborCost: Number(o.labor_cost) || 0,
          serviceCode: o.service_code,
          serviceValue: Number(o.service_value) || 0,
          finishedAt: o.finished_at,
          updatedAt: o.updated_at || o.created_at || new Date().toISOString(),
          type,
        }
      })

      setOrders(mappedOrders)
    } catch (error) {
      console.error('Error loading data', error)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filters.client !== 'all' && o.client !== filters.client) return false
      if (filters.unit !== 'all' && o.unit !== filters.unit) return false
      if (filters.type !== 'all' && o.type !== filters.type) return false
      if (filters.contract !== 'all' && o.contractName !== filters.contract) return false
      if (filters.period !== 'all') {
        const d = new Date(o.date || o.updatedAt)
        const now = new Date()
        if (filters.period === 'Hoje') return d.toDateString() === now.toDateString()
        if (filters.period === 'Semana') {
          const start = new Date(now)
          start.setDate(now.getDate() - now.getDay())
          return d >= start && d <= new Date(start.getTime() + 604800000)
        }
        if (filters.period === 'Mês')
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [orders, filters])

  const updateOrderStatus = async (id: string, status: OSStatus) => {
    await ServiceOrdersService.changeStatus(id, DB_STATUS_MAP[status] as any)
    await loadOrders()
  }

  const updateOrder = async (id: string, data: any) => {
    await ServiceOrdersService.update(id, data)
    await loadOrders()
  }

  const createOrder = async (data: any) => {
    await ServiceOrdersService.create(data)
    await loadOrders()
  }

  const generatePreventives = async (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId)
    if (!contract || !contract.hasPreventive) return
    await ServiceOrdersService.create({
      client_id: contract.clientId,
      contract_id: contract.id,
      priority: 'medium',
      service_type: 'eletrica', // Default category for generated preventives
      status: 'scheduled',
      description: `Manutenção Preventiva Automática - ${contract.name}`,
    })
    await loadOrders()
  }

  const saveContract = async (data: any) => {
    const dbData = {
      client_id: data.clientId,
      name: data.name,
      type: data.type,
      start_date: data.startDate,
      end_date: data.endDate,
    }

    let savedContract
    if (data.id) {
      savedContract = await ContractsRepository.update(data.id, dbData as any)
    } else {
      savedContract = await ContractsRepository.create(dbData as any)
    }

    const contractId = data.id || savedContract?.id

    if (contractId && data.priceItems) {
      await ContractPriceItemsRepository.overwriteForContract(
        contractId,
        data.priceItems.map((p: any) => ({
          contract_id: contractId,
          service_code: p.serviceCode,
          service_name: p.serviceName,
          unit_price: p.unitPrice,
        })),
      )
    }

    await loadOrders()
  }

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        orders,
        filteredOrders,
        clients,
        contracts,
        priceItems,
        filters,
        setDashboardFilter,
        updateOrderStatus,
        updateOrder,
        createOrder,
        saveContract,
        loadOrders,
        generatePreventives,
      }}
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
