import { api } from '../api'

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

export const ClientsRepository = {
  getAll: async () => {
    return await api.clients.list()
  },
  create: async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    return await api.clients.create(data)
  },
  getById: async (id: string) => {
    const clients = await api.clients.list()
    return clients.find((c: any) => c.id === id)
  },
  update: async () => {
    throw new Error('Not implemented')
  },
  delete: async () => {
    throw new Error('Not implemented')
  },
}
