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

    if (newStatus === 'in_progress') {
      updateData.started_at = new Date().toISOString()
    } else if (newStatus === 'completed') {
      updateData.finished_at = new Date().toISOString()
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
