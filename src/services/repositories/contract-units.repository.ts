import { createRepository } from './core/base.repository'

export interface DbContractUnit {
  id: string
  contract_id: string
  prefix: string
  name: string
  address: string
  city: string
  state: string
  responsible_name: string
  responsible_phone?: string
  created_at?: string
  updated_at?: string
}

const MOCK_CONTRACT_UNITS: DbContractUnit[] = [
  {
    id: '88888888-8888-8888-8888-888888888888',
    contract_id: '77777777-7777-7777-7777-777777777777',
    prefix: '001',
    name: 'Agência Centro',
    address: 'Rua Principal, 100',
    city: 'São Paulo',
    state: 'SP',
    responsible_name: 'João Silva',
    responsible_phone: '11999999999',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'unit-2',
    contract_id: 'contract-2',
    prefix: '002',
    name: 'Agência Sul',
    address: 'Av. Sul, 200',
    city: 'Curitiba',
    state: 'PR',
    responsible_name: 'Maria Costa',
    responsible_phone: '41999999999',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const ContractUnitsRepository = createRepository<DbContractUnit, any, any>(
  'contract_units',
  MOCK_CONTRACT_UNITS,
)
