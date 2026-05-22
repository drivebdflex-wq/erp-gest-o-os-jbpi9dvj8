import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export function useAgendaData(currentDate: Date) {
  const [orders, setOrders] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const start = subDays(startOfMonth(currentDate), 7).toISOString()
    const end = addDays(endOfMonth(currentDate), 7).toISOString()

    const [techsRes, clientsRes, ordersRes, unassignedRes] = await Promise.all([
      supabase.from('technicians').select('id, specialty, users(name)'),
      supabase.from('clients').select('id, name'),
      supabase
        .from('service_orders')
        .select(`
        *, clients(name), units(name)
      `)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end),
      supabase
        .from('service_orders')
        .select(`
        *, clients(name), units(name)
      `)
        .is('technician_id', null)
        .neq('status', 'completed'),
    ])

    setTechnicians(techsRes.data || [])
    setClients(clientsRes.data || [])

    const map = new Map()
    if (ordersRes.data) ordersRes.data.forEach((d) => map.set(d.id, d))
    if (unassignedRes.data) unassignedRes.data.forEach((d) => map.set(d.id, d))

    setOrders(Array.from(map.values()))
    setLoading(false)
  }, [currentDate])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('agenda')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, () => {
        fetchData() // Simple full refetch on change to keep joins fresh
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  const updateOrder = async (id: string, updates: any) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
    const { error } = await supabase.from('service_orders').update(updates).eq('id', id)
    if (error) {
      toast({ title: 'Erro ao atualizar OS', description: error.message, variant: 'destructive' })
      fetchData() // revert optimistic update
    } else {
      toast({ title: 'Agenda atualizada com sucesso' })
    }
  }

  return { orders, technicians, clients, loading, updateOrder }
}
