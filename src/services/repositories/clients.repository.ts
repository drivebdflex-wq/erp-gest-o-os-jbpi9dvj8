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

export const baseClientsRepo = createRepository<
  Client,
  Omit<Client, 'id' | 'created_at' | 'updated_at'>,
  Partial<Client>
>('clients', [])

export const ClientsRepository = {
  getAll: async () => await baseClientsRepo.findAll(),
  create: async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) =>
    await baseClientsRepo.create(data),
  getById: async (id: string) => await baseClientsRepo.findById(id),
  update: async (id: string, data: Partial<Client>) => await baseClientsRepo.update(id, data),
  delete: async (id: string) => await baseClientsRepo.delete(id),
}
