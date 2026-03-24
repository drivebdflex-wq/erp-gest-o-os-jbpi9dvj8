import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { ServiceOrderChecklistsRepository } from '../repositories/checklists.repository'
import { PhotosRepository, AuditsRepository } from '../repositories/auxiliary.repository'
import { BusinessError } from './errors'
import type { ServiceOrderStatus, SLAStatus } from '../repositories/types/common'

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
  static async changeStatus(
    orderId: string,
    newStatus: ServiceOrderStatus,
    userId: string = 'system',
  ) {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) {
      throw new BusinessError('Service order not found')
    }

    if (!VALID_TRANSITIONS[order.status]?.includes(newStatus)) {
      throw new BusinessError(`Invalid status transition from '${order.status}' to '${newStatus}'`)
    }

    const updates: any = { status: newStatus }
    const now = new Date()

    if (newStatus === 'in_progress' && order.status !== 'paused') {
      updates.started_at = now.toISOString()
    }

    if (newStatus === 'paused') {
      updates.paused_at = now.toISOString()
    }

    if (newStatus === 'completed') {
      await ServiceOrdersService.validateFinalization(order)

      let durationMinutes = order.total_duration_minutes || 0
      if (order.started_at) {
        const start = new Date(order.started_at).getTime()
        const end = now.getTime()
        const totalMs = end - start
        durationMinutes = Math.floor(Math.max(0, totalMs) / 60000)
      }

      updates.total_duration_minutes = durationMinutes
      updates.finished_at = now.toISOString()

      if (order.deadline_at) {
        const deadline = new Date(order.deadline_at).getTime()
        if (now.getTime() > deadline) {
          updates.sla_status = 'breached' as SLAStatus
        } else if (deadline - now.getTime() < 3600000) {
          // < 1 hour left
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
      user_id: userId,
    })

    return updated
  }

  private static async validateFinalization(order: any) {
    if (!order.customer_signature_url) {
      throw new BusinessError('Customer signature is required to complete the service order')
    }

    const checklists = await ServiceOrderChecklistsRepository.findAll()
    const orderChecklists = checklists.filter((c) => c.service_order_id === order.id)
    if (orderChecklists.some((c) => c.status !== 'completed')) {
      throw new BusinessError('All associated checklists must be completed before finalizing')
    }

    const photos = await PhotosRepository.findAll()
    const initialPhotos = photos.filter(
      (p) => p.related_entity_id === order.id && p.related_entity_type === 'service_order_initial',
    )
    const finalPhotos = photos.filter(
      (p) => p.related_entity_id === order.id && p.related_entity_type === 'service_order_final',
    )

    if (initialPhotos.length === 0 || finalPhotos.length === 0) {
      throw new BusinessError(
        'At least one initial and one final photo are required to complete the service order',
      )
    }
  }
}
