import { createRepository } from './core/base.repository'

export interface DbContract {
  id: string
  client_id: string
  name: string
  type: string
  contract_number: string
  location: string
  start_date: string
  end_date: string
  value?: number
  last_adjustment_date?: string
  next_adjustment_date?: string
  adjustment_type?: string
  adjustment_percentage?: number
  allows_corrective?: boolean
  has_preventive?: boolean
  preventive_frequency?: string
  sla_default?: number
  attachment_url?: string
  created_at?: string
  updated_at?: string
}

const MOCK_CONTRACTS: DbContract[] = [
  {
    id: '77777777-7777-7777-7777-777777777777',
    client_id: '33333333-3333-3333-3333-333333333333',
    name: 'Manutenção Predial Alpha',
    type: 'Manutenção',
    contract_number: 'CT-2023-001',
    location: 'Sede Principal',
    start_date: '2023-01-01',
    end_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    value: 15000,
    last_adjustment_date: '2024-01-01',
    next_adjustment_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    adjustment_type: 'IGPM',
    adjustment_percentage: 4.5,
    allows_corrective: true,
    has_preventive: true,
    preventive_frequency: 'Mensal',
    sla_default: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'contract-2',
    client_id: '33333333-3333-3333-3333-333333333333',
    name: 'Obra Retrofit Elétrico Beta',
    type: 'Obra',
    contract_number: 'OB-2024-042',
    location: 'Filial Sul',
    start_date: '2024-06-01',
    end_date: new Date(Date.now() + 100 * 86400000).toISOString().split('T')[0],
    value: 250000,
    allows_corrective: false,
    has_preventive: false,
    sla_default: 48,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'contract-3',
    client_id: '33333333-3333-3333-3333-333333333333',
    name: 'Ar Condicionado Gama (Vencido)',
    type: 'Manutenção',
    contract_number: 'CT-2022-015',
    location: 'Filial Norte',
    start_date: '2022-03-01',
    end_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    value: 5000,
    allows_corrective: true,
    has_preventive: true,
    preventive_frequency: 'Trimestral',
    sla_default: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const ContractsRepository = createRepository<DbContract, any, any>(
  'contracts',
  MOCK_CONTRACTS,
)
