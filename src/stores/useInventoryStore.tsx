import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface Product {
  id: string
  code: string
  name: string
  category: string
  unit: string
  average_cost: number
  minimum_stock: number
}

export interface StockBalance {
  id: string
  product_id: string
  location_type: 'central' | 'vehicle'
  location_id: string
  quantity: number
}

export interface StockMovement {
  id: string
  type: 'entrada' | 'saída' | 'transferência' | 'ajuste'
  origin: 'compra' | 'OS' | 'requisição' | 'inventário' | 'manual'
  product_id: string
  quantity: number
  source_location?: string
  destination_location?: string
  date: string
}

export interface Requisition {
  id: string
  requester: string
  vehicle_id: string
  status: 'pendente' | 'aprovado' | 'entregue'
  date: string
  items: { product_id: string; quantity: number }[]
}

interface InventoryState {
  products: Product[]
  balances: StockBalance[]
  movements: StockMovement[]
  requisitions: Requisition[]
  addProduct: (p: Omit<Product, 'id'>) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addMovement: (m: Omit<StockMovement, 'id' | 'date'>) => void
  addRequisition: (r: Omit<Requisition, 'id' | 'date' | 'status'>) => void
  updateRequisitionStatus: (id: string, status: 'pendente' | 'aprovado' | 'entregue') => void
  consumeForOS: (productId: string, quantity: number, vehicleId?: string) => void
  adjustInventory: (
    productId: string,
    locationType: 'central' | 'vehicle',
    locationId: string,
    realQuantity: number,
  ) => void
}

const InventoryContext = createContext<InventoryState | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'p1',
      code: 'CAB-001',
      name: 'Cabo UTP Cat6',
      category: 'Cabeamento',
      unit: 'm',
      average_cost: 3,
      minimum_stock: 500,
    },
    {
      id: 'p2',
      code: 'CON-001',
      name: 'Conector RJ45',
      category: 'Conectores',
      unit: 'un',
      average_cost: 1,
      minimum_stock: 1000,
    },
    {
      id: 'p3',
      code: 'ROT-001',
      name: 'Roteador Wi-Fi',
      category: 'Equipamentos',
      unit: 'un',
      average_cost: 100,
      minimum_stock: 20,
    },
  ])

  const [balances, setBalances] = useState<StockBalance[]>([
    {
      id: 'b1',
      product_id: 'p1',
      location_type: 'central',
      location_id: 'central',
      quantity: 1500,
    },
    {
      id: 'b2',
      product_id: 'p2',
      location_type: 'central',
      location_id: 'central',
      quantity: 2000,
    },
    { id: 'b3', product_id: 'p3', location_type: 'central', location_id: 'central', quantity: 15 },
    { id: 'b4', product_id: 'p1', location_type: 'vehicle', location_id: 'v1', quantity: 100 },
    { id: 'b5', product_id: 'p2', location_type: 'vehicle', location_id: 'v1', quantity: 200 },
  ])

  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: 'm1',
      type: 'entrada',
      origin: 'compra',
      product_id: 'p1',
      quantity: 1000,
      destination_location: 'central',
      date: new Date().toISOString(),
    },
  ])

  const [requisitions, setRequisitions] = useState<Requisition[]>([
    {
      id: 'req1',
      requester: 'Carlos Silva',
      vehicle_id: 'v1',
      status: 'pendente',
      date: new Date().toISOString(),
      items: [{ product_id: 'p3', quantity: 2 }],
    },
  ])

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...p, id: Math.random().toString() }])
  }, [])

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const addMovement = useCallback((m: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...m,
      id: Math.random().toString(),
      date: new Date().toISOString(),
    }

    setBalances((prev) => {
      let next = [...prev]
      if (m.source_location) {
        const idx = next.findIndex(
          (b) => b.product_id === m.product_id && b.location_id === m.source_location,
        )
        if (idx >= 0) {
          if (next[idx].quantity < m.quantity) throw new Error('Estoque insuficiente na origem')
          next[idx] = { ...next[idx], quantity: next[idx].quantity - m.quantity }
        } else {
          throw new Error('Estoque não encontrado na origem')
        }
      }

      if (m.destination_location) {
        const destType = m.destination_location === 'central' ? 'central' : 'vehicle'
        const idx = next.findIndex(
          (b) => b.product_id === m.product_id && b.location_id === m.destination_location,
        )
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + m.quantity }
        } else {
          next.push({
            id: Math.random().toString(),
            product_id: m.product_id,
            location_type: destType,
            location_id: m.destination_location,
            quantity: m.quantity,
          })
        }
      }
      return next
    })

    setMovements((prev) => [newMovement, ...prev])
  }, [])

  const addRequisition = useCallback((r: Omit<Requisition, 'id' | 'date' | 'status'>) => {
    setRequisitions((prev) => [
      ...prev,
      { ...r, id: Math.random().toString(), status: 'pendente', date: new Date().toISOString() },
    ])
  }, [])

  const updateRequisitionStatus = useCallback(
    (id: string, status: 'pendente' | 'aprovado' | 'entregue') => {
      setRequisitions((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            if (status === 'entregue' && r.status !== 'entregue') {
              r.items.forEach((item) => {
                addMovement({
                  type: 'transferência',
                  origin: 'requisição',
                  product_id: item.product_id,
                  quantity: item.quantity,
                  source_location: 'central',
                  destination_location: r.vehicle_id,
                })
              })
            }
            return { ...r, status }
          }
          return r
        }),
      )
    },
    [addMovement],
  )

  const consumeForOS = useCallback(
    (productId: string, quantity: number, vehicleId?: string) => {
      let remaining = quantity
      const vBal = vehicleId
        ? balances.find((b) => b.product_id === productId && b.location_id === vehicleId)
        : null
      const cBal = balances.find((b) => b.product_id === productId && b.location_type === 'central')

      if (vBal && vBal.quantity > 0) {
        const toConsume = Math.min(vBal.quantity, remaining)
        addMovement({
          type: 'saída',
          origin: 'OS',
          product_id: productId,
          quantity: toConsume,
          source_location: vehicleId,
        })
        remaining -= toConsume
      }

      if (remaining > 0 && cBal && cBal.quantity >= remaining) {
        addMovement({
          type: 'saída',
          origin: 'OS',
          product_id: productId,
          quantity: remaining,
          source_location: 'central',
        })
        remaining = 0
      }

      if (remaining > 0) {
        throw new Error('Estoque insuficiente para a OS')
      }
    },
    [balances, addMovement],
  )

  const adjustInventory = useCallback(
    (
      productId: string,
      locationType: 'central' | 'vehicle',
      locationId: string,
      realQuantity: number,
    ) => {
      const bal = balances.find((b) => b.product_id === productId && b.location_id === locationId)
      const currentQty = bal ? bal.quantity : 0
      const diff = realQuantity - currentQty

      if (diff === 0) return

      if (diff > 0) {
        addMovement({
          type: 'ajuste',
          origin: 'inventário',
          product_id: productId,
          quantity: diff,
          destination_location: locationId,
        })
      } else {
        addMovement({
          type: 'ajuste',
          origin: 'inventário',
          product_id: productId,
          quantity: Math.abs(diff),
          source_location: locationId,
        })
      }
    },
    [balances, addMovement],
  )

  return (
    <InventoryContext.Provider
      value={{
        products,
        balances,
        movements,
        requisitions,
        addProduct,
        updateProduct,
        deleteProduct,
        addMovement,
        addRequisition,
        updateRequisitionStatus,
        consumeForOS,
        adjustInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export default function useInventoryStore() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventoryStore must be used within an InventoryProvider')
  return context
}
