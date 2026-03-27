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
  ]),
  async findByUserId(userId: string): Promise<UserRole[]> {
    if (isMock) return (await this.findAll()).filter((ur) => ur.user_id === userId)
    return supabase.request<UserRole[]>(`user_roles?user_id=eq.${userId}&select=*`)
  },
}

export const TeamsRepository = createRepository<Team, any, any>('teams', [
  {
    id: 'team-alpha',
    name: 'Alpha Team',
    supervisor_id: 'admin-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

const baseTechniciansRepository = createRepository<Technician, any, any>('technicians', [
  {
    id: 'tech-record-1',
    user_id: 'tech-id',
    name: 'Carlos Silva',
    team_id: 'team-alpha',
    specialty: 'General Maintenance',
    availability_status: 'available',
    salary_type: 'mensal',
    salary_amount: 5000,
    cost_per_hour: 22.72,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

export const TechniciansRepository = {
  ...baseTechniciansRepository,
  async findByUserId(userId: string): Promise<Technician | null> {
    if (isMock)
      return (await baseTechniciansRepository.findAll()).find((t) => t.user_id === userId) || null
    const result = await supabase.request<Technician[]>(`technicians?user_id=eq.${userId}&select=*`)
    return result.length > 0 ? result[0] : null
  },
}
