import { AuthService } from '@/services/business/auth.service'
import { ResponseHandler } from './core/response.handler'
import { z } from 'zod'

const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export class AuthController {
  static async login(body: unknown) {
    try {
      const data = LoginDto.parse(body)
      const result = await AuthService.login(data.email, data.password)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
