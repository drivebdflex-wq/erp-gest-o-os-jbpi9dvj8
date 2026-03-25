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

export const ClientsRepository = createRepository<Client, any, any>('clients', [
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Condomínio Alpha',
    document: '12.345.678/0001-90',
    email: 'contato@alpha.com',
    phone: '11999999999',
    address: 'Av. Paulista, 1000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])
