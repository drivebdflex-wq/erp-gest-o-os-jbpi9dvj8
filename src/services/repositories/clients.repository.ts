import { api } from '../api'
import { createRepository } from './core/base.repository'

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

const mockClients: Client[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'Tech Corp S.A.',
    document: '12.345.678/0001-90',
    email: 'contato@techcorp.com',
    phone: '(11) 4002-8922',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c838848d-6489-40da-9e32-0545f94d975a',
    name: 'Condomínio Residencial Flores',
    document: '98.765.432/0001-10',
    email: 'sindico@resflores.com',
    phone: '(21) 3333-4444',
    address: 'Rua das Flores, 123 - Rio de Janeiro, RJ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const baseClientsRepo = createRepository<
  Client,
  Omit<Client, 'id' | 'created_at' | 'updated_at'>,
  Partial<Client>
>('clients', mockClients)

export const ClientsRepository = {
  getAll: async () => {
    try {
      return await api.clients.list()
    } catch (e) {
      console.warn('API /api/clients failed, falling back to mock memory data')
      return await baseClientsRepo.findAll()
    }
  },
  create: async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      return await api.clients.create(data)
    } catch (e) {
      return await baseClientsRepo.create(data)
    }
  },
  getById: async (id: string) => {
    try {
      const clients = await api.clients.list()
      const client = clients.find((c: any) => c.id === id)
      if (client) return client
      return await baseClientsRepo.findById(id)
    } catch (e) {
      return await baseClientsRepo.findById(id)
    }
  },
  update: async (id: string, data: Partial<Client>) => {
    return await baseClientsRepo.update(id, data)
  },
  delete: async (id: string) => {
    return await baseClientsRepo.delete(id)
  },
}
