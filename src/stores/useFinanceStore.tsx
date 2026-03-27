import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface Revenue {
  id: string
  contractId: string
  value: number
  type: 'mensal' | 'medição' | 'extra'
  date: string
  status: 'previsto' | 'recebido'
  isFixed?: boolean
}

export interface Purchase {
  id: string
  contractId: string
  supplier: string
  type: 'material' | 'serviço'
  value: number
  date: string
  invoiceUrl?: string
  materialName?: string
  productId?: string
  quantity?: number
  status: 'solicitado' | 'aprovado' | 'reprovado' | 'liberado'
}

export interface Cost {
  id: string
  contractId: string
  category:
    | 'mão de obra'
    | 'combustível'
    | 'terceirizado'
    | 'equipamento'
    | 'outros'
    | 'material_os'
    | 'administrativo'
  value: number
  date: string
  description: string
  origin?: 'compra' | 'os' | 'manual'
}

interface FinanceState {
  revenues: Revenue[]
  purchases: Purchase[]
  costs: Cost[]
  addRevenue: (r: Omit<Revenue, 'id'>) => void
  addPurchase: (p: Omit<Purchase, 'id' | 'status'>) => void
  updatePurchaseStatus: (
    id: string,
    status: 'solicitado' | 'aprovado' | 'reprovado' | 'liberado',
  ) => void
  addCost: (c: Omit<Cost, 'id'>) => void
}

const FinanceContext = createContext<FinanceState | undefined>(undefined)

const today = new Date()
const formatD = (d: Date) => d.toISOString().split('T')[0]
const d0 = formatD(today)
const dPast1 = formatD(new Date(today.getTime() - 15 * 86400000))
const dPast2 = formatD(new Date(today.getTime() - 45 * 86400000))
const dFut1 = formatD(new Date(today.getTime() + 15 * 86400000))
const dFut2 = formatD(new Date(today.getTime() + 45 * 86400000))

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [revenues, setRevenues] = useState<Revenue[]>([
    {
      id: 'r1',
      contractId: '77777777-7777-7777-7777-777777777777',
      value: 25000,
      type: 'mensal',
      date: dPast1,
      status: 'recebido',
      isFixed: true,
    },
    {
      id: 'r2',
      contractId: 'contract-2',
      value: 150000,
      type: 'medição',
      date: dPast2,
      status: 'recebido',
      isFixed: false,
    },
    {
      id: 'r3',
      contractId: '77777777-7777-7777-7777-777777777777',
      value: 30000,
      type: 'mensal',
      date: dFut1,
      status: 'previsto',
      isFixed: true,
    },
    {
      id: 'r4',
      contractId: 'contract-3',
      value: 5000,
      type: 'mensal',
      date: dPast1,
      status: 'recebido',
      isFixed: true,
    },
    {
      id: 'r5',
      contractId: 'contract-2',
      value: 150000,
      type: 'medição',
      date: dFut2,
      status: 'previsto',
      isFixed: false,
    },
  ])

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: 'p1',
      contractId: '77777777-7777-7777-7777-777777777777',
      supplier: 'Elétrica Brasil',
      type: 'material',
      value: 300,
      date: dPast1,
      materialName: 'Cabo UTP Cat6',
      productId: 'p1',
      quantity: 100,
      status: 'liberado',
    },
    {
      id: 'p2',
      contractId: '77777777-7777-7777-7777-777777777777',
      supplier: 'Tech Info',
      type: 'material',
      value: 1500,
      date: dPast2,
      materialName: 'Roteador Wi-Fi',
      productId: 'p3',
      quantity: 15,
      status: 'liberado',
    },
    {
      id: 'p3',
      contractId: 'contract-2',
      supplier: 'Ferramentas Express',
      type: 'material',
      value: 5000,
      date: d0,
      materialName: 'Conector RJ45',
      productId: 'p2',
      quantity: 50,
      status: 'solicitado',
    },
  ])

  const [costs, setCosts] = useState<Cost[]>([
    {
      id: 'c1',
      contractId: '77777777-7777-7777-7777-777777777777',
      category: 'mão de obra',
      value: 5000,
      date: dPast1,
      description: 'Salários equipe',
      origin: 'manual',
    },
    {
      id: 'c2',
      contractId: 'contract-2',
      category: 'equipamento',
      value: 200000,
      date: dPast2,
      description: 'Compra de transformadores',
      origin: 'manual',
    },
    {
      id: 'c3',
      contractId: 'contract-3',
      category: 'equipamento',
      value: 12000,
      date: dPast1,
      description: 'Reparo compressor',
      origin: 'manual',
    },
    {
      id: 'c4',
      contractId: '77777777-7777-7777-7777-777777777777',
      category: 'administrativo',
      value: 2000,
      date: dPast1,
      description: 'Software ERP e Licenças',
      origin: 'manual',
    },
    {
      id: 'c5',
      contractId: '77777777-7777-7777-7777-777777777777',
      category: 'material_os',
      value: 2500,
      date: dPast1,
      description: 'Cabos e conectores',
      origin: 'os',
    },
  ])

  const addRevenue = useCallback((r: Omit<Revenue, 'id'>) => {
    setRevenues((prev) => [...prev, { ...r, id: Math.random().toString() }])
  }, [])

  const addCost = useCallback((c: Omit<Cost, 'id'>) => {
    setCosts((prev) => [...prev, { ...c, id: Math.random().toString() }])
  }, [])

  const addPurchase = useCallback((p: Omit<Purchase, 'id' | 'status'>) => {
    const newPurchase: Purchase = { ...p, id: Math.random().toString(), status: 'solicitado' }
    setPurchases((prev) => [...prev, newPurchase])
  }, [])

  const updatePurchaseStatus = useCallback(
    (id: string, status: 'solicitado' | 'aprovado' | 'reprovado' | 'liberado') => {
      setPurchases((prev) => {
        const p = prev.find((x) => x.id === id)
        if (!p) return prev

        if (status === 'liberado' && p.status !== 'liberado') {
          if (p.type === 'serviço') {
            addCost({
              contractId: p.contractId,
              category: 'terceirizado',
              value: p.value,
              date: new Date().toISOString().split('T')[0],
              description: `Serviço liberado de ${p.supplier}`,
              origin: 'compra',
            })
          }
        }

        return prev.map((x) => (x.id === id ? { ...x, status } : x))
      })
    },
    [addCost],
  )

  return (
    <FinanceContext.Provider
      value={{
        revenues,
        purchases,
        costs,
        addRevenue,
        addPurchase,
        updatePurchaseStatus,
        addCost,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export default function useFinanceStore() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinanceStore must be used within a FinanceProvider')
  return context
}
