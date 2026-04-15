import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { SupabaseService } from '../../supabase.service'
import { CreateServiceOrderDto } from './service-orders.controller'

@Injectable()
export class ServiceOrdersService {
  private readonly logger = new Logger(ServiceOrdersService.name)

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateServiceOrderDto) {
    if (!createDto.client_id) {
      throw new BadRequestException('client_id is mandatory')
    }

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('service_orders')
        .insert([createDto])
        .select()
        .single()

      if (error) {
        this.logger.error(`Error creating service order: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to create service order')
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in create service order: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException || err instanceof BadRequestException)
        throw err
      throw new InternalServerErrorException('Unexpected error creating service order')
    }
  }

  async findAll(status?: string) {
    try {
      let query = this.supabaseService
        .getClient()
        .from('service_orders')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        this.logger.error(`Error fetching service orders: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to fetch service orders')
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in findAll service orders: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException) throw err
      throw new InternalServerErrorException('Unexpected error fetching service orders')
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('service_orders')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        if (error) this.logger.warn(`Supabase error finding order ${id}: ${error.message}`)
        throw new NotFoundException(`Service order with ID ${id} not found`)
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in findOne service order: ${err.message}`, err.stack)
      if (err instanceof NotFoundException) throw err
      throw new InternalServerErrorException(`Unexpected error fetching service order ${id}`)
    }
  }

  async updateStatus(id: string, newStatus: string) {
    if (!newStatus) {
      throw new BadRequestException('Status is required')
    }

    const order = await this.findOne(id)

    const validTransitions: Record<string, string[]> = {
      draft: ['pending'],
      pending: ['scheduled', 'cancelled'],
      scheduled: ['deslocamento', 'cancelled', 'pending'],
      deslocamento: ['in_progress', 'cancelled', 'pending'],
      in_progress: ['paused', 'in_audit', 'cancelled'],
      paused: ['in_progress', 'cancelled'],
      in_audit: ['completed', 'rejected'],
      rejected: ['in_progress'],
      completed: [],
      cancelled: [],
    }

    const allowedNext = validTransitions[order.status] || []

    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${order.status}' to '${newStatus}'. Allowed transitions are: ${allowedNext.join(', ')}.`,
      )
    }

    const updateData: any = { status: newStatus }
    const now = new Date()

    if (newStatus === 'in_progress') {
      if (!order.started_at) {
        updateData.started_at = now.toISOString()
      }
    } else if (newStatus === 'completed') {
      if (!order.started_at) {
        throw new BadRequestException(
          'Integrity Error: Cannot complete service order without a started_at timestamp.',
        )
      }

      const finishedAt = now
      const startedAt = new Date(order.started_at)

      updateData.finished_at = finishedAt.toISOString()
      updateData.total_duration_minutes = Math.floor(
        (finishedAt.getTime() - startedAt.getTime()) / 60000,
      )
    }

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('service_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        this.logger.error(`Error updating service order status: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to update service order status')
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in updateStatus service order: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException || err instanceof BadRequestException)
        throw err
      throw new InternalServerErrorException('Unexpected error updating service order status')
    }
  }

  async remove(id: string) {
    const order = await this.findOne(id)

    if (order.status === 'in_progress' || order.status === 'in_audit') {
      throw new BadRequestException('Cannot delete an active or in-audit service order')
    }

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('service_orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        this.logger.error(`Error deleting service order: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to delete service order')
      }
      return { success: true, message: 'Service order deleted successfully' }
    } catch (err: any) {
      this.logger.error(`Exception in remove service order: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException || err instanceof BadRequestException)
        throw err
      throw new InternalServerErrorException('Unexpected error deleting service order')
    }
  }
}
