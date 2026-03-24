import { createRepository } from './core/base.repository'
import { isMock, supabase } from '@/lib/supabase'
import type { User, UserRole, Role, Technician } from './types/users'

export const UsersRepository = createRepository<User, any, any>('users', [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Admin User',
    email: 'admin@example.com',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

export const UserRolesRepository = {
  ...createRepository<UserRole, any, any>('user_roles', [
    {
      user_id: '22222222-2222-2222-2222-222222222222',
      role_id: '11111111-1111-1111-1111-111111111111',
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

export const RolesRepository = createRepository<Role, any, any>('roles', [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Administrator',
    description: 'Full system access',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
])

const baseTechniciansRepository = createRepository<Technician, any, any>('technicians', [
  {
    id: '44444444-4444-4444-4444-444444444444',
    user_id: '22222222-2222-2222-2222-222222222222',
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
