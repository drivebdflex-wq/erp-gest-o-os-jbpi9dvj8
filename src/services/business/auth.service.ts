import { UsersRepository, UserRolesRepository } from '../repositories/users.repository'
import { BusinessError } from './errors'
import { bcrypt } from '@/lib/bcrypt'

export class AuthService {
  static async login(email: string, password_raw: string) {
    const users = await UsersRepository.findAll()
    const user = users.find((u) => u.email === email)

    if (!user) {
      throw new BusinessError('Unauthorized: Invalid credentials')
    }

    const isMatch = await bcrypt.compare(password_raw, user.password_hash)
    if (!isMatch) {
      throw new BusinessError('Unauthorized: Invalid credentials')
    }

    if (user.status !== 'active') {
      throw new BusinessError('Forbidden: User account is not active')
    }

    const userRoles = await UserRolesRepository.findByUserId(user.id)
    let role_id = 'role-tecnico'
    if (userRoles && userRoles.length > 0) {
      role_id = userRoles[0].role_id
    }

    // Creating a mock JWT
    const payload = {
      sub: user.id,
      email: user.email,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 1 day expiration
    }

    const token = btoa(JSON.stringify(payload))

    const { password_hash: _, ...userWithoutPassword } = user
    return {
      token,
      user: {
        ...userWithoutPassword,
        role_id,
        active: user.status === 'active',
      },
    }
  }
}
