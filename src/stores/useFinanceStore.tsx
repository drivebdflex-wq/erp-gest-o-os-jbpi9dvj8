import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface Revenue {
  id: string
  contractId: string
  value: number
  type: 'mensal' | 'medição' | 'extra'
  date: string
  status: 'previsto' | 'recebido'
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
  quantity?: number
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
}

export interface InventoryItem {
  id: string
  materialName: string
  quantity: number
  unitCost: number
  totalCost: number
}

interface FinanceState {
  revenues: Revenue[]
  purchases: Purchase[]
  costs: Cost[]
  inventory: InventoryItem[]
  addRevenue: (r: Omit<Revenue, 'id'>) => void
  addPurchase: (p: Omit<Purchase, 'id'>) => void
  addCost: (c: Omit<Cost, 'id'>) => void
  consumeMaterial: (inventoryId: string, quantity: number, contractId: string, osId: string) => void
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
    },
    {
      id: 'r2',
      contractId: 'contract-2',
      value: 150000,
      type: 'medição',
      date: dPast2,
      status: 'recebido',
    },
    {
      id: 'r3',
      contractId: '77777777-7777-7777-7777-777777777777',
      value: 30000,
      type: 'mensal',
      date: dFut1,
      status: 'previsto',
    },
    {
      id: 'r4',
      contractId: 'contract-3',
      value: 5000,
      type: 'mensal',
      date: dPast1,
      status: 'recebido',
    },
    {
      id: 'r5',
      contractId: 'contract-2',
      value: 150000,
      type: 'medição',
      date: dFut2,
      status: 'previsto',
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
      quantity: 100,
    },
    {
      id: 'p2',
      contractId: '77777777-7777-7777-7777-777777777777',
      supplier: 'Tech Info',
      type: 'material',
      value: 1500,
      date: dPast2,
      materialName: 'Roteador Wi-Fi',
      quantity: 15,
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
    },
    {
      id: 'c2',
      contractId: 'contract-2',
      category: 'equipamento',
      value: 200000,
      date: dPast2,
      description: 'Compra de transformadores',
    },
    {
      id: 'c3',
      contractId: 'contract-3',
      category: 'equipamento',
      value: 12000,
      date: dPast1,
      description: 'Reparo compressor',
    },
    {
      id: 'c4',
      contractId: '77777777-7777-7777-7777-777777777777',
      category: 'administrativo',
      value: 2000,
      date: dPast1,
      description: 'Software ERP e Licenças',
    },
    {
      id: 'c5',
      contractId: '77777777-7777-7777-7777-777777777777',
      category: 'material_os',
      value: 2500,
      date: dPast1,
      description: 'Cabos e conectores',
    },
    {
      id: 'c6',
      contractId: '77777777-7777-7777-7777-777777777777',
      category: 'mão de obra',
      value: 5000,
      date: dFut1,
      description: 'Salários previstos',
    },
  ])

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'i1', materialName: 'Cabo UTP Cat6', quantity: 100, unitCost: 3, totalCost: 300 },
    { id: 'i2', materialName: 'Conector RJ45', quantity: 500, unitCost: 1, totalCost: 500 },
    { id: 'i3', materialName: 'Roteador Wi-Fi', quantity: 15, unitCost: 100, totalCost: 1500 },
  ])

  const addRevenue = useCallback((r: Omit<Revenue, 'id'>) => {
    setRevenues((prev) => [...prev, { ...r, id: Math.random().toString() }])
  }, [])

  const addCost = useCallback((c: Omit<Cost, 'id'>) => {
    setCosts((prev) => [...prev, { ...c, id: Math.random().toString() }])
  }, [])

  const addPurchase = useCallback(
    (p: Omit<Purchase, 'id'>) => {
      const newPurchase = { ...p, id: Math.random().toString() }
      setPurchases((prev) => [...prev, newPurchase])

      if (p.type === 'material' && p.materialName && p.quantity) {
        const unitCost = p.value / p.quantity
        setInventory((prev) => {
          const existing = prev.find((i) => i.materialName === p.materialName)
          if (existing) {
            const newQty = existing.quantity + p.quantity!
            const newTotalCost = existing.totalCost + p.value
            const newUnitCost = newTotalCost / newQty
            return prev.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: newQty, totalCost: newTotalCost, unitCost: newUnitCost }
                : i,
            )
          } else {
            return [
              ...prev,
              {
                id: Math.random().toString(),
                materialName: p.materialName!,
                quantity: p.quantity!,
                unitCost,
                totalCost: p.value,
              },
            ]
          }
        })
      } else if (p.type === 'serviço') {
        addCost({
          contractId: p.contractId,
          category: 'terceirizado',
          value: p.value,
          date: p.date,
          description: `Serviço de ${p.supplier}`,
        })
      }
    },
    [addCost],
  )

  const consumeMaterial = useCallback(
    (inventoryId: string, quantity: number, contractId: string, osId: string) => {
      const item = inventory.find((i) => i.id === inventoryId)
      if (!item) throw new Error('Material não encontrado no estoque')
      if (item.quantity < quantity)
        throw new Error(`Estoque insuficiente. Disponível: ${item.quantity}`)

      const costValue = quantity * item.unitCost

      addCost({
        contractId,
        category: 'material_os',
        value: costValue,
        date: new Date().toISOString().split('T')[0],
        description: `Consumo OS ${osId.split('-')[0]}: ${quantity}x ${item.materialName}`,
      })

      setInventory((prev) =>
        prev.map((i) =>
          i.id === inventoryId
            ? {
                ...i,
                quantity: i.quantity - quantity,
                totalCost: i.totalCost - costValue,
              }
            : i,
        ),
      )
    },
    [inventory, addCost],
  )

  return (
    <FinanceContext.Provider
      value={{
        revenues,
        purchases,
        costs,
        inventory,
        addRevenue,
        addPurchase,
        addCost,
        consumeMaterial,
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
