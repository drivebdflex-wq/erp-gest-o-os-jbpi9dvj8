import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { ServiceOrderChecklistsRepository } from '../repositories/checklists.repository'
import { PhotosRepository, AuditsRepository } from '../repositories/auxiliary.repository'
import {
  UserRolesRepository,
  RolesRepository,
  TechniciansRepository,
} from '../repositories/users.repository'
import { BusinessError } from './errors'
import type { ServiceOrderStatus, SLAStatus } from '../repositories/types/common'
import type { ServiceOrder } from '../repositories/types/service-orders'

const VALID_TRANSITIONS: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  draft: ['pending'],
  pending: ['scheduled', 'in_progress', 'cancelled'],
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'completed', 'cancelled', 'in_audit'],
  paused: ['in_progress', 'cancelled'],
  in_audit: ['completed', 'rejected'],
  completed: [],
  rejected: ['pending'],
  cancelled: [],
}

export class ServiceOrdersService {
  private static async checkAuthorization(order: ServiceOrder, userId: string) {
    if (userId === 'system') return

    // Check if user is admin
    const userRoles = await UserRolesRepository.findByUserId(userId)
    const roles = await RolesRepository.findAll()
    const adminRoleIds = roles.filter((r) => r.name === 'Administrator').map((r) => r.id)
    const isAdmin = userRoles.some((ur) => adminRoleIds.includes(ur.role_id))

    if (isAdmin) return

    // Check ownership
    const technician = await TechniciansRepository.findByUserId(userId)
    if (!technician || order.technician_id !== technician.id) {
      throw new BusinessError(
        'Unauthorized: You do not have permissions to modify this service order',
      )
    }
  }

  static async update(orderId: string, updates: Partial<ServiceOrder>, userId: string = 'system') {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) {
      throw new BusinessError('Service order not found')
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BusinessError(`Cannot modify a service order that is already ${order.status}`)
    }

    await this.checkAuthorization(order, userId)

    const updated = await ServiceOrdersRepository.update(orderId, updates)

    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: orderId,
      action: 'UPDATE',
      old_value: order,
      new_value: updated,
      user_id: userId === 'system' ? null : userId,
    })

    return updated
  }

  static async changeStatus(
    orderId: string,
    newStatus: ServiceOrderStatus,
    userId: string = 'system',
  ) {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) {
      throw new BusinessError('Service order not found')
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BusinessError(`Cannot modify a service order that is already ${order.status}`)
    }

    await this.checkAuthorization(order, userId)

    if (!VALID_TRANSITIONS[order.status]?.includes(newStatus)) {
      throw new BusinessError(`Invalid status transition from '${order.status}' to '${newStatus}'`)
    }

    const updates: any = { status: newStatus }
    const now = new Date()

    if (newStatus === 'in_progress') {
      if (!order.started_at) {
        updates.started_at = now.toISOString()
      }
      updates.last_resumed_at = now.toISOString()
    }

    if (newStatus === 'paused' || newStatus === 'completed') {
      if (order.last_resumed_at) {
        const start = new Date(order.last_resumed_at).getTime()
        const end = now.getTime()
        const totalMs = end - start
        const sessionMinutes = Math.floor(Math.max(0, totalMs) / 60000)
        updates.total_duration_minutes = (order.total_duration_minutes || 0) + sessionMinutes
      }

      if (newStatus === 'paused') {
        updates.paused_at = now.toISOString()
        updates.last_resumed_at = null
      }
    }

    if (newStatus === 'completed') {
      await ServiceOrdersService.validateFinalization(order)
      updates.finished_at = now.toISOString()
      updates.last_resumed_at = null

      if (order.deadline_at) {
        const deadline = new Date(order.deadline_at).getTime()
        if (now.getTime() > deadline) {
          updates.sla_status = 'breached' as SLAStatus
        } else if (deadline - now.getTime() < 3600000) {
          updates.sla_status = 'warning' as SLAStatus
        } else {
          updates.sla_status = 'within_sla' as SLAStatus
        }
      }
    }

    const updated = await ServiceOrdersRepository.update(orderId, updates)

    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: orderId,
      action: 'STATUS_CHANGE',
      old_value: { status: order.status },
      new_value: { status: newStatus },
      user_id: userId === 'system' ? null : userId,
    })

    return updated
  }

  private static async validateFinalization(order: any) {
    if (!order.customer_signature_url) {
      throw new BusinessError('Customer signature is required to complete the service order')
    }

    const orderChecklists = await ServiceOrderChecklistsRepository.findByServiceOrderId(order.id)
    if (orderChecklists.some((c) => c.status !== 'completed')) {
      throw new BusinessError('All associated checklists must be completed before finalizing')
    }

    const orderPhotos = await PhotosRepository.findByServiceOrderId(order.id)
    const initialPhotos = orderPhotos.filter((p) => p.type === 'initial')
    const finalPhotos = orderPhotos.filter((p) => p.type === 'final')

    if (initialPhotos.length === 0 || finalPhotos.length === 0) {
      throw new BusinessError(
        'At least one initial and one final photo are required to complete the service order',
      )
    }
  }
}
