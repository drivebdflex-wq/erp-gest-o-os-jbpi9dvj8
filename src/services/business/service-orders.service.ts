import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { AuditsRepository } from '../repositories/auxiliary.repository'
import {
  UserRolesRepository,
  RolesRepository,
  TechniciansRepository,
  TeamsRepository,
} from '../repositories/users.repository'
import { ClientsRepository } from '../repositories/clients.repository'
import { BusinessError } from './errors'
import type { ServiceOrderStatus, SLAStatus } from '../repositories/types/common'
import type { ServiceOrder, CreateServiceOrderDTO } from '../repositories/types/service-orders'

const VALID_TRANSITIONS: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  draft: ['pending'],
  pending: ['scheduled', 'cancelled'],
  scheduled: ['deslocamento', 'cancelled', 'pending'],
  deslocamento: ['in_progress', 'cancelled', 'pending'],
  in_progress: ['paused', 'in_audit', 'cancelled'],
  paused: ['in_progress', 'cancelled'],
  in_audit: ['completed', 'rejected'],
  completed: [],
  rejected: ['in_progress'],
  cancelled: [],
}

export class ServiceOrdersService {
  private static async checkAuthorization(order: ServiceOrder, userId: string) {
    if (userId === 'system') return
    const userRoles = await UserRolesRepository.findByUserId(userId)
    const roles = await RolesRepository.findAll()
    const roleNames = userRoles.map((ur) => roles.find((r) => r.id === ur.role_id)?.name)
    if (roleNames.includes('Administrator')) return
    const technician = await TechniciansRepository.findByUserId(userId)
    if (!technician || order.technician_id !== technician.id) {
      throw new BusinessError('Forbidden: No permissions for this service order')
    }
  }

  static async findAll(userId: string = 'system') {
    return ServiceOrdersRepository.findAll()
  }

  static async findById(id: string, userId: string = 'system') {
    const order = await ServiceOrdersRepository.findById(id)
    if (!order) throw new BusinessError('Service order not found')
    return order
  }

  static async create(data: CreateServiceOrderDTO, userId: string = 'system') {
    if (!data.client_id) throw new BusinessError('client_id is mandatory')
    if (!data.unit_id)
      throw new BusinessError(
        'unit_id is mandatory. Service Order must be associated with an agency.',
      )

    const created = await ServiceOrdersRepository.create(data as any)
    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: created.id,
      action: 'CREATE',
      old_value: null,
      new_value: created,
    })
    return created
  }

  static async update(orderId: string, updates: Partial<ServiceOrder>, userId: string = 'system') {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) throw new BusinessError('Service order not found')

    const updated = await ServiceOrdersRepository.update(orderId, updates)
    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: orderId,
      action: 'UPDATE',
      old_value: order,
      new_value: updated,
    })
    return updated
  }

  static async changeStatus(
    orderId: string,
    newStatus: ServiceOrderStatus,
    userId: string = 'system',
  ) {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) throw new BusinessError('Service order not found')
    if (!VALID_TRANSITIONS[order.status]?.includes(newStatus))
      throw new BusinessError(`Invalid status transition to '${newStatus}'`)

    const updates: any = { status: newStatus }
    const now = new Date()

    if (newStatus === 'in_progress') {
      if (!order.started_at) updates.started_at = now.toISOString()
      updates.last_resumed_at = now.toISOString()
    }

    if (newStatus === 'paused') {
      if (order.last_resumed_at) {
        const sessionMinutes = Math.floor(
          Math.max(0, now.getTime() - new Date(order.last_resumed_at).getTime()) / 60000,
        )
        updates.total_duration_minutes = (order.total_duration_minutes || 0) + sessionMinutes
      }
      updates.paused_at = now.toISOString()
      updates.last_resumed_at = null
    }

    if (newStatus === 'completed') {
      if (!order.started_at) throw new BusinessError('Cannot complete without started_at')
      updates.finished_at = now.toISOString()
      updates.last_resumed_at = null
      updates.total_duration_minutes = Math.floor(
        (now.getTime() - new Date(order.started_at).getTime()) / 60000,
      )

      if (order.technician_id) {
        const tech = await TechniciansRepository.findById(order.technician_id)
        if (tech && tech.cost_per_hour)
          updates.labor_cost = (updates.total_duration_minutes / 60) * tech.cost_per_hour
      } else if (order.team_id) {
        updates.labor_cost = (updates.total_duration_minutes / 60) * 100 // Mock team rate
      }
      updates.sla_status = 'within_sla' as SLAStatus
    }

    const updated = await ServiceOrdersRepository.update(orderId, updates)

    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: orderId,
      action: 'UPDATE',
      old_value: order,
      new_value: updated,
    })

    return updated
  }

  static async delete(orderId: string, userId: string = 'system') {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) throw new BusinessError('Service order not found')

    await this.checkAuthorization(order, userId)

    if (ServiceOrdersRepository.delete) {
      await ServiceOrdersRepository.delete(orderId)
    }

    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: orderId,
      action: 'DELETE',
      old_value: order,
      new_value: null,
    })

    return { success: true }
  }
}
