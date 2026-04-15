import { z } from 'zod'

export const CreateServiceOrderDto = z.object({
  client_id: z.string().min(1, 'client_id is mandatory'),
  unit_id: z.string().optional().nullable(),
  technician_id: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  description: z.string().min(1, 'description is mandatory'),
  status: z
    .enum([
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
    ])
    .optional()
    .default('pending'),
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
