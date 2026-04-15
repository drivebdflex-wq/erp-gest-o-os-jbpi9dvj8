import { createRepository } from './core/base.repository'
import { isMock, supabase } from '@/lib/supabase'

export interface Client {
  id: string
  name: string
  document: string
  email: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}

export const ClientsRepository = createRepository<Client, any, any>('clients', [])
