import { z } from 'zod'

export const CreateServiceOrderDto = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  technician_id: z.string().optional().nullable(),
  status: z
    .enum([
      'draft',
      'pending',
      'scheduled',
      'in_progress',
      'paused',
      'in_audit',
      'completed',
      'rejected',
      'cancelled',
    ])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  description: z.string().optional(),
  scheduled_at: z.string().optional(),
  deadline_at: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  customer_signature_url: z.string().url().optional(),
})

export const UpdateServiceOrderDto = CreateServiceOrderDto.partial()

export const UpdateStatusDto = z.object({
  status: z.enum([
    'draft',
    'pending',
    'scheduled',
    'in_progress',
    'paused',
    'in_audit',
    'completed',
    'rejected',
    'cancelled',
  ]),
  userId: z.string().optional(),
})
