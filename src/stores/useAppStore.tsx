import React, { createContext, useContext, useState, ReactNode } from 'react'

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
  {
    id: 'OS-1043',
    title: 'Reparo Cabeamento Fibra Óptica',
    client: 'TechCorp SA',
    status: 'Aberta',
    priority: 'Alta',
    date: '2023-10-25',
    tech: 'Não Atribuído',
    address: 'Rua Augusta, 500',
    distance: '5.1 km',
  },
  {
    id: 'OS-1044',
    title: 'Troca de Roteador Wi-Fi',
    client: 'Escola Modelo',
    status: 'Planejada',
    priority: 'Baixa',
    date: '2023-10-26',
    tech: 'Ana Souza',
    address: 'Av. Brasil, 200',
    distance: '12 km',
  },
  {
    id: 'OS-1045',
    title: 'Instalação Câmeras Segurança',
    client: 'Loja Centro',
    status: 'Em Auditoria',
    priority: 'Alta',
    date: '2023-10-24',
    tech: 'Carlos Silva',
    address: 'Rua Direita, 10',
    distance: '1.2 km',
  },
  {
    id: 'OS-1046',
    title: 'Verificação Quadro Elétrico',
    client: 'Edifício Beta',
    status: 'Pausada',
    priority: 'Média',
    date: '2023-10-25',
    tech: 'Marcos Paulo',
    address: 'Av. Faria Lima, 3000',
    distance: '4.5 km',
  },
]

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin')
  const [orders, setOrders] = useState<Order[]>(initialOrders)

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
