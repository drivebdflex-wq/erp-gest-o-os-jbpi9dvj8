import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common'
import { SupabaseService } from '../../supabase.service'

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name)

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    try {
      const client = this.supabase.getClient()
      const { data, error } = await client
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        this.logger.error(`Error fetching clients: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to fetch clients')
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in findAll: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException) throw err
      throw new InternalServerErrorException('An unexpected error occurred while fetching clients')
    }
  }

  async create(payload: any) {
    try {
      const client = this.supabase.getClient()
      const { data, error } = await client.from('clients').insert([payload]).select().single()

      if (error) {
        this.logger.error(`Error creating client: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to create client')
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in create: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException) throw err
      throw new InternalServerErrorException('An unexpected error occurred while creating client')
    }
  }
}
