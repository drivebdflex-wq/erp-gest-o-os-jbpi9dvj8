import { ID, Timestamps } from './common'

export interface Team extends Timestamps {
  id: ID
  name: string
  supervisor_id?: ID | null
  active?: boolean
}

export interface CreateTeamDTO {
  name: string
  supervisor_id?: ID | null
  active?: boolean
}

export type UpdateTeamDTO = Partial<CreateTeamDTO>

export interface Technician extends Timestamps {
  id: ID
  user_id?: ID
  name?: string
  team_id?: ID | null
  specialty?: string
  availability_status: string
  salary_type?: 'mensal' | 'diária' | 'hora'
  salary_amount?: number
  cost_per_hour?: number
}

export interface CreateTechnicianDTO {
  user_id?: ID
  name?: string
  team_id?: ID | null
  specialty?: string
  availability_status?: string
  salary_type?: 'mensal' | 'diária' | 'hora'
  salary_amount?: number
  cost_per_hour?: number
}

export type UpdateTechnicianDTO = Partial<CreateTechnicianDTO>
