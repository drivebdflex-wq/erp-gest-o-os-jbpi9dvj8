import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { ServiceOrderChecklistsRepository } from '../repositories/checklists.repository'
import { PhotosRepository, AuditsRepository } from '../repositories/auxiliary.repository'
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
  scheduled: ['deslocamento', 'cancelled'],
  deslocamento: ['in_progress', 'cancelled'],
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

    if (roleNames.includes('Supervisor')) {
      const teams = await TeamsRepository.findAll()
      const myTeams = teams.filter((t) => t.supervisor_id === userId).map((t) => t.id)

      const allTechs = await TechniciansRepository.findAll()
      const myTechIds = allTechs
        .filter((t) => t.team_id && myTeams.includes(t.team_id))
        .map((t) => t.id)

      if (order.technician_id && myTechIds.includes(order.technician_id)) return
    }

    const technician = await TechniciansRepository.findByUserId(userId)
    if (!technician || order.technician_id !== technician.id) {
      throw new BusinessError(
        'Forbidden: You do not have permissions to access or modify this service order',
      )
    }
  }

  static async findAll(userId: string = 'system') {
    const orders = await ServiceOrdersRepository.findAll()

    if (userId === 'system') return orders

    const userRoles = await UserRolesRepository.findByUserId(userId)
    const roles = await RolesRepository.findAll()
    const roleNames = userRoles.map((ur) => roles.find((r) => r.id === ur.role_id)?.name)

    if (roleNames.includes('Administrator')) return orders

    if (roleNames.includes('Supervisor')) {
      const teams = await TeamsRepository.findAll()
      const myTeams = teams.filter((t) => t.supervisor_id === userId).map((t) => t.id)

      const allTechs = await TechniciansRepository.findAll()
      const myTechIds = allTechs
        .filter((t) => t.team_id && myTeams.includes(t.team_id))
        .map((t) => t.id)

      return orders.filter((o) => o.technician_id && myTechIds.includes(o.technician_id))
    }

    const technician = await TechniciansRepository.findByUserId(userId)
    if (technician) {
      return orders.filter((o) => o.technician_id === technician.id)
    }

    return []
  }

  static async findById(id: string, userId: string = 'system') {
    const order = await ServiceOrdersRepository.findById(id)
    if (!order) {
      throw new BusinessError('Service order not found')
    }

    await this.checkAuthorization(order, userId)

    return order
  }

  static async create(data: CreateServiceOrderDTO, userId: string = 'system') {
    if (!data.client_id) {
      throw new BusinessError('client_id is mandatory')
    }

    const client = await ClientsRepository.findById(data.client_id)
    if (!client) {
      throw new BusinessError('Cliente não encontrado')
    }

    if (data.technician_id) {
      const technician = await TechniciansRepository.findById(data.technician_id)
      if (!technician) {
        throw new BusinessError('Técnico não encontrado')
      }
    }

    const created = await ServiceOrdersRepository.create(data as any)
    await AuditsRepository.create({
      table_name: 'service_orders',
      record_id: created.id,
      action: 'CREATE',
      old_value: null,
      new_value: created,
      user_id: userId === 'system' ? null : userId,
    })
    return created
  }

  static async update(orderId: string, updates: Partial<ServiceOrder>, userId: string = 'system') {
    const order = await ServiceOrdersRepository.findById(orderId)
    if (!order) {
      throw new BusinessError('Service order not found')
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BusinessError(
        `Forbidden: Cannot modify a service order that is already ${order.status}`,
      )
    }

    if ('client_id' in updates && !updates.client_id) {
      throw new BusinessError('client_id is mandatory and cannot be null')
    }

    await this.checkAuthorization(order, userId)

    if (updates.client_id !== undefined) {
      const client = await ClientsRepository.findById(updates.client_id)
      if (!client) {
        throw new BusinessError('Cliente não encontrado')
      }
    }

    if (updates.technician_id !== undefined && updates.technician_id !== null) {
      const technician = await TechniciansRepository.findById(updates.technician_id)
      if (!technician) {
        throw new BusinessError('Técnico não encontrado')
      }
    }

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
      throw new BusinessError(
        `Forbidden: Cannot modify a service order that is already ${order.status}`,
      )
    }

    await this.checkAuthorization(order, userId)

    if (!VALID_TRANSITIONS[order.status]?.includes(newStatus)) {
      throw new BusinessError(
        `Forbidden: Invalid status transition from '${order.status}' to '${newStatus}'`,
      )
    }

    const updates: any = { status: newStatus }
    const now = new Date()

    if (newStatus === 'in_progress') {
      if (!order.started_at) {
        updates.started_at = now.toISOString()
      }
      updates.last_resumed_at = now.toISOString()
    }

    if (newStatus === 'paused') {
      if (order.last_resumed_at) {
        const start = new Date(order.last_resumed_at).getTime()
        const end = now.getTime()
        const totalMs = end - start
        const sessionMinutes = Math.floor(Math.max(0, totalMs) / 60000)
        updates.total_duration_minutes = (order.total_duration_minutes || 0) + sessionMinutes
      }
      updates.paused_at = now.toISOString()
      updates.last_resumed_at = null
    }

    if (newStatus === 'completed') {
      if (!order.started_at) {
        throw new BusinessError(
          'Integrity Error: Cannot complete service order without a started_at timestamp.',
        )
      }

      await ServiceOrdersService.validateFinalization(order)

      updates.finished_at = now.toISOString()
      updates.last_resumed_at = null

      const startedAt = new Date(order.started_at).getTime()
      updates.total_duration_minutes = Math.floor((now.getTime() - startedAt) / 60000)

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
      throw new BusinessError(
        'Forbidden: Customer signature is required to complete the service order',
      )
    }

    const orderChecklists = await ServiceOrderChecklistsRepository.findByServiceOrderId(order.id)
    if (orderChecklists.some((c) => c.status !== 'completed')) {
      throw new BusinessError(
        'Forbidden: All associated checklists must be completed before finalizing',
      )
    }

    const orderPhotos = await PhotosRepository.findByServiceOrderId(order.id)
    const initialPhotos = orderPhotos.filter((p) => p.type === 'initial')
    const finalPhotos = orderPhotos.filter((p) => p.type === 'final')

    if (initialPhotos.length === 0 || finalPhotos.length === 0) {
      throw new BusinessError(
        'Forbidden: At least one initial and one final photo are required to complete the service order',
      )
    }
  }
}
