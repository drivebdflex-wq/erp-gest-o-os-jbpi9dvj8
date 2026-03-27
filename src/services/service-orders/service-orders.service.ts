import { isMock, supabase } from '@/lib/supabase'
import { ServiceOrder, CreateServiceOrderDTO, ServiceOrderStatus } from './service-orders.types'

let mockOrders: ServiceOrder[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    client_id: '33333333-3333-3333-3333-333333333333',
    technician_id: 'tech-record-1',
    status: 'pending',
    priority: 'high',
    description: 'Manutenção preventiva ar-condicionado',
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    client_id: '33333333-3333-3333-3333-333333333333',
    technician_id: 'tech-record-1',
    status: 'in_progress',
    priority: 'medium',
    description: 'Elevator system routine check.',
    scheduled_at: new Date().toISOString(),
    started_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export class ServiceOrdersService {
  static async createServiceOrder(data: CreateServiceOrderDTO): Promise<ServiceOrder> {
    if (!data.client_id) {
      throw new Error('client_id is mandatory')
    }

    if (!data.unit_id) {
      throw new Error('Validation Error: unit_id is mandatory.')
    }

    if (!data.description) {
      throw new Error('Validation Error: description is required.')
    }

    const newOrder: ServiceOrder = {
      id: crypto.randomUUID(),
      client_id: data.client_id,
      unit_id: data.unit_id,
      technician_id: data.technician_id || null,
      description: data.description,
      priority: data.priority || 'medium',
      scheduled_at: data.scheduled_at,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isMock) {
      mockOrders.push(newOrder)
      return newOrder
    }

    const result = await supabase.request<ServiceOrder[]>('service_orders', {
      method: 'POST',
      body: JSON.stringify(newOrder),
    })
    return result[0]
  }

  static async getServiceOrders(): Promise<ServiceOrder[]> {
    if (isMock) return [...mockOrders]
    return supabase.request<ServiceOrder[]>('service_orders?select=*')
  }

  static async getServiceOrderById(id: string): Promise<ServiceOrder> {
    if (isMock) {
      const order = mockOrders.find((o) => o.id === id)
      if (!order) throw new Error('Not Found: Service order not found')
      return order
    }

    const result = await supabase.request<ServiceOrder[]>(`service_orders?id=eq.${id}&select=*`)
    if (!result.length) throw new Error('Not Found: Service order not found')
    return result[0]
  }

  static async updateServiceOrderStatus(
    id: string,
    status: ServiceOrderStatus,
  ): Promise<ServiceOrder> {
    const order = await this.getServiceOrderById(id)

    const validTransitions: Record<string, string[]> = {
      draft: ['pending'],
      pending: ['scheduled', 'cancelled'],
      scheduled: ['deslocamento', 'cancelled'],
      deslocamento: ['in_progress', 'cancelled'],
      in_progress: ['paused', 'in_audit', 'cancelled'],
      paused: ['in_progress', 'cancelled'],
      in_audit: ['completed', 'rejected'],
      rejected: ['in_progress'],
      completed: [],
      cancelled: [],
    }

    const allowedNext = validTransitions[order.status] || []

    if (!allowedNext.includes(status)) {
      throw new Error(`Invalid status transition from '${order.status}' to '${status}'.`)
    }

    const updates: Partial<ServiceOrder> = { status }
    const now = new Date()

    if (status === 'in_progress') {
      if (!order.started_at) {
        updates.started_at = now.toISOString()
      }
    } else if (status === 'completed') {
      if (!order.started_at) {
        throw new Error(
          'Integrity Error: Cannot complete service order without a started_at timestamp.',
        )
      }

      const finishedAt = now
      const startedAt = new Date(order.started_at)

      updates.total_duration_minutes = Math.floor(
        (finishedAt.getTime() - startedAt.getTime()) / 60000,
      )
    }

    return this.updateServiceOrder(id, updates)
  }

  static async updateServiceOrder(
    id: string,
    updates: Partial<ServiceOrder>,
  ): Promise<ServiceOrder> {
    if ('client_id' in updates && !updates.client_id) {
      throw new Error('Validation Error: client_id is mandatory and cannot be null.')
    }

    if (isMock) {
      const index = mockOrders.findIndex((o) => o.id === id)
      if (index === -1) throw new Error('Not Found: Service order not found')
      mockOrders[index] = { ...mockOrders[index], ...updates, updated_at: new Date().toISOString() }
      return mockOrders[index]
    }

    const result = await supabase.request<ServiceOrder[]>(`service_orders?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
    })
    return result[0]
  }
}
