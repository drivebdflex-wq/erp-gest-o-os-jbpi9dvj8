import { z } from 'zod'

export const CreateUserDto = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
})

export const UpdateUserDto = CreateUserDto.partial()
