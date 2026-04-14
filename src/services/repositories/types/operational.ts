import { ID, Timestamps } from './common'

export interface Team extends Timestamps {
  id: ID
  name: string
  supervisor_id?: ID | null
}

export interface CreateTeamDTO {
  name: string
  supervisor_id?: ID | null
}

export type UpdateTeamDTO = Partial<CreateTeamDTO>

export interface Technician extends Timestamps {
  id: ID
  user_id: ID
  team_id?: ID | null
  specialty?: string
  availability_status: string
}

export interface CreateTechnicianDTO {
  user_id: ID
  team_id?: ID | null
  specialty?: string
  availability_status?: string
}

export type UpdateTechnicianDTO = Partial<CreateTechnicianDTO>
