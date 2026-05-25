import { createRepository } from './core/base.repository'
import type {
  Team,
  CreateTeamDTO,
  UpdateTeamDTO,
  Technician,
  CreateTechnicianDTO,
  UpdateTechnicianDTO,
} from './types/operational'

const MOCK_TECHNICIANS: Technician[] = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    user_id: '22222222-2222-2222-2222-222222222222',
    specialty: 'General Maintenance',
    availability_status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const TeamsRepository = createRepository<Team, CreateTeamDTO, UpdateTeamDTO>('teams', [])
export const TechniciansRepository = createRepository<
  Technician,
  CreateTechnicianDTO,
  UpdateTechnicianDTO
>('technicians', MOCK_TECHNICIANS)
