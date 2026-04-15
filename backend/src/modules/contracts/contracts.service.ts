import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { SupabaseService } from '../../supabase.service'

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name)

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(status?: string) {
    try {
      let query = this.supabaseService
        .getClient()
        .from('contracts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        this.logger.error(`Error fetching contracts: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to fetch contracts')
      }
      return data
    } catch (err: any) {
      this.logger.error(`Exception in findAll contracts: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException) throw err
      throw new InternalServerErrorException('Unexpected error fetching contracts')
    }
  }

  async remove(id: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('contracts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        this.logger.error(`Error deleting contract: ${error.message}`, error)
        throw new InternalServerErrorException('Failed to delete contract')
      }
      return { success: true, message: 'Contract soft-deleted successfully', data }
    } catch (err: any) {
      this.logger.error(`Exception in remove contract: ${err.message}`, err.stack)
      if (err instanceof InternalServerErrorException) throw err
      throw new InternalServerErrorException('Unexpected error deleting contract')
    }
  }
}
