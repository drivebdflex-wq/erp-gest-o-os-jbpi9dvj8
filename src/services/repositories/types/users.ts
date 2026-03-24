import { ID, Timestamps } from './common'

export interface User extends Timestamps {
  id: ID
  name: string
  email: string
  password_hash: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface CreateUserDTO {
  name: string
  email: string
  password_hash: string
  status?: 'active' | 'inactive' | 'suspended'
}

export type UpdateUserDTO = Partial<CreateUserDTO>

export interface Role extends Timestamps {
  id: ID
  name: string
  description?: string
}

export interface CreateRoleDTO {
  name: string
  description?: string
}

export type UpdateRoleDTO = Partial<CreateRoleDTO>

export interface UserRole extends Timestamps {
  user_id: ID
  role_id: ID
}
