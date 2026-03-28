import { z } from 'zod'

export const CreateServiceOrderDto = z.object({
  client_id: z.string().min(1, 'client_id is mandatory'),
  unit_id: z.string().min(1, 'unit_id is mandatory'),
  technician_id: z.string().optional().nullable(),
  team_id: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  service_type: z.enum([
    'eletrica',
    'hidraulica',
    'civil',
    'serralheria',
    'marmoraria',
    'marcenaria',
  ]),
  description: z.string().optional(),
  scheduled_at: z.string().optional(),
  estimated_duration_minutes: z.number().optional(),
  service_code: z.string().optional().nullable(),
  service_value: z.number().optional().nullable(),
})

export const UpdateStatusDto = z.object({
  status: z.enum([
    'draft',
    'pending',
    'scheduled',
    'deslocamento',
    'in_progress',
    'paused',
    'in_audit',
    'completed',
    'rejected',
    'cancelled',
  ]),
})
