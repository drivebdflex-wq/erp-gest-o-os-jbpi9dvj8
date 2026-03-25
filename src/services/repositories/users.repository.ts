import { createRepository } from './core/base.repository'
import { isMock, supabase } from '@/lib/supabase'
import type { User, UserRole, Role, Team, Technician } from './types/users'

export const UsersRepository = createRepository<User, any, any>('users', [
  {
    id: 'admin-id',
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: 'admin123',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sup-id',
    name: 'Supervisor User',
    email: 'supervisor@example.com',
    password_hash: 'sup123',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tech-id',
    name: 'Carlos Silva',
    email: 'tech@example.com',
    password_hash: 'tech123',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

export const RolesRepository = createRepository<Role, any, any>('roles', [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full system access',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'role-sup',
    name: 'Supervisor',
    description: 'Team management',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'role-tech',
    name: 'Technician',
    description: 'Field operations',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

export const UserRolesRepository = {
  ...createRepository<UserRole, any, any>('user_roles', [
    {
      user_id: 'admin-id',
      role_id: 'role-admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      user_id: 'sup-id',
      role_id: 'role-sup',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      user_id: 'tech-id',
      role_id: 'role-tech',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]),
  async findByUserId(userId: string): Promise<UserRole[]> {
    if (isMock) {
      const all = await this.findAll()
      return all.filter((ur) => ur.user_id === userId)
    }
    return supabase.request<UserRole[]>(`user_roles?user_id=eq.${userId}&select=*`)
  },
}

export const TeamsRepository = createRepository<Team, any, any>('teams', [
  {
    id: 'team-alpha',
    name: 'Alpha Team',
    supervisor_id: 'sup-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

const baseTechniciansRepository = createRepository<Technician, any, any>('technicians', [
  {
    id: 'tech-record-1',
    user_id: 'tech-id',
    team_id: 'team-alpha',
    specialty: 'General Maintenance',
    availability_status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

export const TechniciansRepository = {
  ...baseTechniciansRepository,
  async findByUserId(userId: string): Promise<Technician | null> {
    if (isMock) {
      const all = await baseTechniciansRepository.findAll()
      return all.find((t) => t.user_id === userId) || null
    }
    const result = await supabase.request<Technician[]>(`technicians?user_id=eq.${userId}&select=*`)
    return result.length > 0 ? result[0] : null
  },
}
