import { ID, Timestamps } from './common'

export interface User extends Timestamps {
  id: ID
  name: string
  email: string
  password_hash: string
  status: string
  role?: 'admin' | 'supervisor' | 'tecnico'
}

export interface UserRole extends Timestamps {
  user_id: ID
  role_id: ID
}

export interface Role extends Timestamps {
  id: ID
  name: string
  description?: string
}

export interface Team extends Timestamps {
  id: ID
  name: string
  supervisor_id?: ID | null
}

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
