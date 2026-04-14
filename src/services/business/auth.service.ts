import { UsersRepository } from '../repositories/users.repository'
import { BusinessError } from './errors'

export class AuthService {
  static async login(email: string, password_hash: string) {
    const users = await UsersRepository.findAll()
    const user = users.find((u) => u.email === email)

    if (!user || user.password_hash !== password_hash) {
      throw new BusinessError('Unauthorized: Invalid credentials')
    }

    if (user.status !== 'active') {
      throw new BusinessError('Forbidden: User account is not active')
    }

    // Creating a mock JWT
    const payload = {
      sub: user.id,
      email: user.email,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 1 day expiration
    }

    const token = btoa(JSON.stringify(payload))

    const { password_hash: _, ...userWithoutPassword } = user
    return { token, user: userWithoutPassword }
  }
}
