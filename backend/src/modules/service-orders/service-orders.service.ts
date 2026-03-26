import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { SupabaseService } from '../../supabase.service'
import { CreateServiceOrderDto } from './service-orders.controller'

@Injectable()
export class ServiceOrdersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateServiceOrderDto) {
    console.log('DATA RECEBIDA:', createDto)

    if (!createDto.client_id) {
      throw new BadRequestException('client_id é obrigatório')
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('service_orders')
      .insert([createDto])
      .select()
      .single()

    if (error) {
      throw new InternalServerErrorException(error.message)
    }
    return data
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('service_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new InternalServerErrorException(error.message)
    }
    return data
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new NotFoundException(`Service order with ID ${id} not found`)
    }
    return data
  }

  async updateStatus(id: string, newStatus: string) {
    if (!newStatus) {
      throw new BadRequestException('Status is required')
    }

    const order = await this.findOne(id)

    const validTransitions: Record<string, string[]> = {
      pending: ['in_progress'],
      in_progress: ['completed'],
    }

    const allowedNext = validTransitions[order.status] || []

    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${order.status}' to '${newStatus}'. Allowed transitions are: pending -> in_progress -> completed.`,
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

    const { data, error } = await this.supabaseService
      .getClient()
      .from('service_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new InternalServerErrorException(error.message)
    }
    return data
  }
}
