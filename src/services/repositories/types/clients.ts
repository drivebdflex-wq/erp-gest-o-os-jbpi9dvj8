import { ID, Timestamps } from './common'

export interface Client extends Timestamps {
  id: ID
  name: string
  document: string
  email?: string
  phone?: string
  address?: string
}

export interface CreateClientDTO {
  name: string
  document: string
  email?: string
  phone?: string
  address?: string
}

export type UpdateClientDTO = Partial<CreateClientDTO>

export interface Contract extends Timestamps {
  id: ID
  client_id: ID
  start_date: string
  end_date: string
  value?: number
  terms?: string
}

export interface CreateContractDTO {
  client_id: ID
  start_date: string
  end_date: string
  value?: number
  terms?: string
}

export type UpdateContractDTO = Partial<CreateContractDTO>
