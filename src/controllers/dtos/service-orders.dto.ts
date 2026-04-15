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
  order_number: z.string().optional(),
  call_code: z.string().optional(),
  asset_number: z.string().optional(),
  client_unit: z.string().optional(),
  address: z.string().optional(),
  floor: z.string().optional(),
  distance_km: z.number().optional(),
  environment: z.string().optional(),
  criticality: z.string().optional(),
  is_incident: z.boolean().optional(),
  requested_by: z.string().optional(),
  requester_registration: z.string().optional(),
  requester_phone: z.string().optional(),
  situation_code: z.number().optional(),
  displacement_cost: z.number().optional(),
  labor_cost: z.number().optional(),
  material_cost: z.number().optional(),
  total_cost: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.any()).optional(),
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
