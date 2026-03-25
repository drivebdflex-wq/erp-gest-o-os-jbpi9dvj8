import { z } from 'zod'

export const CreateServiceOrderDto = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  technician_id: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  description: z.string().optional(),
  scheduled_at: z.string().optional(),
})

export const UpdateStatusDto = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']),
})
