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
  budget_labor?: number
  budget_material?: number
  budget_fuel?: number
  budget_others?: number
  planned_techs?: number
  planned_hours?: number
  estimated_team_cost?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export const ContractsRepository = createRepository<DbContract, any, any>('contracts')
