import { z } from 'zod'

export const CreateChecklistDto = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  created_by: z.string().optional().nullable(),
})

export const UpdateChecklistDto = CreateChecklistDto.partial()

export const CreateChecklistResponseDto = z.object({
  service_order_checklist_id: z.string().min(1, 'Service Order Checklist ID is required'),
  checklist_item_id: z.string().min(1, 'Checklist Item ID is required'),
  response_text: z.string().optional(),
  response_boolean: z.boolean().optional(),
  response_number: z.number().optional(),
  photo_url: z.string().url().optional(),
})
