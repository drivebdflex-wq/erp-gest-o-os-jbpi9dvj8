import { createRepository } from './core/base.repository'
import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  Contract,
  CreateContractDTO,
  UpdateContractDTO,
} from './types/clients'

const MOCK_CLIENTS: Client[] = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Acme Corporation',
    document: '12.345.678/0001-90',
    email: 'contact@acme.com',
    phone: '555-0199',
    address: '123 Business Avenue',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const ClientsRepository = createRepository<Client, CreateClientDTO, UpdateClientDTO>(
  'clients',
  MOCK_CLIENTS,
)
export const ContractsRepository = createRepository<Contract, CreateContractDTO, UpdateContractDTO>(
  'contracts',
  [],
)
