import { ID, Timestamps } from './common'

export interface User extends Timestamps {
  id: ID
  name: string
  email: string
  status: string
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

export interface Technician extends Timestamps {
  id: ID
  user_id: ID
  team_id?: ID | null
  specialty?: string
  availability_status: string
}
