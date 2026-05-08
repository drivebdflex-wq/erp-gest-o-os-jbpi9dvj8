import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Product {
  id: string
  code: string
  name: string
  description?: string
  category: string
  unit: string
  price?: number
  average_cost: number
  minimum_stock: number
  created_at?: string
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
  isLoading: boolean
  error: { code: string; message: string } | null
  fetchData: (simulateError?: boolean) => Promise<void>
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>
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
  const [products, setProducts] = useState<Product[]>([])
  const [balances, setBalances] = useState<StockBalance[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ code: string; message: string } | null>(null)

  const fetchData = useCallback(async (simulateError = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const table = simulateError ? 'inventory_not_exist' : 'products'
      const [prodRes, balRes, movRes] = await Promise.all([
        supabase.from(table).select('*').order('name'),
        supabase.from('inventory').select('*'),
        supabase.from('movements').select('*').order('date', { ascending: false }),
      ])

      if (prodRes.error) throw prodRes.error
      if (balRes.error) throw balRes.error
      if (movRes.error) throw movRes.error

      setProducts(prodRes.data || [])
      setBalances(balRes.data || [])
      setMovements(movRes.data || [])
    } catch (err: any) {
      setError({
        code: err.code || 'UNKNOWN',
        message: err.message || 'Falha ao comunicar com Supabase.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Math.random().toString(), created_at: new Date().toISOString() }
    setProducts((prev) => [...prev, newProduct as Product])
    await supabase.from('products').insert(newProduct)
  }, [])

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
    supabase.from('products').update(p).eq('id', id)
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id))
    supabase.from('products').delete().eq('id', id)
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
        }
      }
      if (m.destination_location) {
        const destType = m.destination_location === 'central' ? 'central' : 'vehicle'
        const idx = next.findIndex(
          (b) => b.product_id === m.product_id && b.location_id === m.destination_location,
        )
        if (idx >= 0) next[idx] = { ...next[idx], quantity: next[idx].quantity + m.quantity }
        else
          next.push({
            id: Math.random().toString(),
            product_id: m.product_id,
            location_type: destType,
            location_id: m.destination_location,
            quantity: m.quantity,
          })
      }
      return next
    })
    setMovements((prev) => [newMovement, ...prev])
    supabase.from('movements').insert(newMovement)
  }, [])

  const addRequisition = useCallback((r: Omit<Requisition, 'id' | 'date' | 'status'>) => {
    setRequisitions((prev) => [
      ...prev,
      { ...r, id: Math.random().toString(), status: 'pendente', date: new Date().toISOString() },
    ])
  }, [])

  const updateRequisitionStatus = useCallback(
    (id: string, status: 'pendente' | 'aprovado' | 'entregue') => {
      setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    },
    [],
  )

  const consumeForOS = useCallback(
    (productId: string, quantity: number, vehicleId?: string) => {
      addMovement({
        type: 'saída',
        origin: 'OS',
        product_id: productId,
        quantity,
        source_location: vehicleId || 'central',
      })
    },
    [addMovement],
  )

  const adjustInventory = useCallback(
    (
      productId: string,
      locationType: 'central' | 'vehicle',
      locationId: string,
      realQuantity: number,
    ) => {
      addMovement({
        type: 'ajuste',
        origin: 'inventário',
        product_id: productId,
        quantity: realQuantity,
        destination_location: locationId,
      })
    },
    [addMovement],
  )

  return (
    <InventoryContext.Provider
      value={{
        products,
        balances,
        movements,
        requisitions,
        isLoading,
        error,
        fetchData,
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
