import { createRepository } from './core/base.repository'
import type {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
} from './types/users'

const MOCK_USERS: User[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: 'hashed_pwd_123',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const UsersRepository = createRepository<User, CreateUserDTO, UpdateUserDTO>(
  'users',
  MOCK_USERS,
)
export const RolesRepository = createRepository<Role, CreateRoleDTO, UpdateRoleDTO>('roles', [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Administrator',
    description: 'Full system access',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])
