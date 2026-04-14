import { z } from 'zod'

export const CreateMaterialDto = z.object({
  name: z.string().min(1, 'Name is required'),
  unit_type: z.string().optional(),
  sku: z.string().optional(),
})

export const UpdateMaterialDto = CreateMaterialDto.partial()

export const AssignMaterialDto = z.object({
  serviceOrderId: z.string().min(1, 'Service Order ID is required'),
  quantity: z.number().positive(),
})

export const RestockMaterialDto = z.object({
  quantity: z.number().positive(),
})
