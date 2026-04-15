import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../supabase.service'

@Injectable()
export class ClientsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const client = this.supabase.getClient()
    const { data, error } = await client
      .from('clients')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  }

  async create(payload: any) {
    const client = this.supabase.getClient()
    const { data, error } = await client.from('clients').insert([payload]).select().single()

    if (error) throw error
    return data
  }
}
