import { UsersRepository } from '../repositories/users.repository'
import { BusinessError } from './errors'
import { bcrypt } from '@/lib/bcrypt'

const EXTERNAL_API_URL = 'https://erp-gest-o-os-jbpi9dvj8.onrender.com/api/users'

const omitPassword = (user: any) => {
  if (!user) return user
  const { password_hash, ...rest } = user
  return rest
}

export class UsersService {
  static async findAll() {
    try {
      const response = await fetch(EXTERNAL_API_URL)
      if (!response.ok) throw new Error('Failed to fetch from external API')
      const users = await response.json()
      return users.map(omitPassword)
    } catch (error: any) {
      throw new BusinessError(error.message || 'Failed to fetch users')
    }
  }

  static async findById(id: string) {
    const user = await UsersRepository.findById(id)
    if (!user) {
      throw new BusinessError('User not found')
    }
    return omitPassword(user)
  }

  static async deleteUser(id: string) {
    const deleted = await UsersRepository.delete(id)
    if (!deleted) {
      throw new BusinessError('User not found')
    }
    return true
  }

  static async create(data: any) {
    if (!data.email || !data.email.includes('@')) {
      throw new BusinessError('Invalid email format')
    }
    if (!data.password || data.password.length < 6) {
      throw new BusinessError('Password must be at least 6 characters')
    }

    const password_hash = await bcrypt.hash(data.password, 10)

    const newUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password_hash,
      role: data.role || 'tecnico',
      status: data.status || 'active',
      created_at: new Date().toISOString(),
    }

    try {
      const response = await fetch(EXTERNAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create user in external API')
      }

      const created = await response.json()
      return omitPassword(created)
    } catch (error: any) {
      throw new BusinessError(error.message || 'Error creating user')
    }
  }

  // legacy alias
  static async createUser(data: any) {
    return this.create(data)
  }

  static async updateUser(id: string, data: any) {
    if (data.email) {
      if (!data.email.includes('@')) {
        throw new BusinessError('Invalid email format')
      }
      const existingUsers = await UsersRepository.findAll()
      if (existingUsers.some((u) => u.email === data.email && u.id !== id)) {
        throw new BusinessError('Email already exists')
      }
    }

    const updateData = { ...data }
    if (updateData.password) {
      updateData.password_hash = await bcrypt.hash(updateData.password, 10)
      delete updateData.password
    }

    const updated = await UsersRepository.update(id, updateData)
    if (!updated) {
      throw new BusinessError('User not found')
    }
    return omitPassword(updated)
  }

  static async suspendUser(id: string) {
    const updated = await UsersRepository.update(id, { status: 'suspended' })
    if (!updated) {
      throw new BusinessError('User not found')
    }
    return omitPassword(updated)
  }
}
