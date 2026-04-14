import { UsersRepository } from '../repositories/users.repository'
import type { CreateUserDTO, UpdateUserDTO } from '../repositories/types/users'
import { BusinessError } from './errors'

export class UsersService {
  static async findAll() {
    return UsersRepository.findAll()
  }

  static async findById(id: string) {
    const user = await UsersRepository.findById(id)
    if (!user) {
      throw new BusinessError('User not found')
    }
    return user
  }

  static async deleteUser(id: string) {
    const deleted = await UsersRepository.delete(id)
    if (!deleted) {
      throw new BusinessError('User not found')
    }
    return true
  }

  static async createUser(data: CreateUserDTO) {
    if (!data.email || !data.email.includes('@')) {
      throw new BusinessError('Invalid email format')
    }
    if (!data.password_hash || data.password_hash.length < 6) {
      throw new BusinessError('Password must be at least 6 characters')
    }

    const existingUsers = await UsersRepository.findAll()
    if (existingUsers.some((u) => u.email === data.email)) {
      throw new BusinessError('Email already exists')
    }

    return UsersRepository.create(data)
  }

  static async updateUser(id: string, data: UpdateUserDTO) {
    if (data.email) {
      if (!data.email.includes('@')) {
        throw new BusinessError('Invalid email format')
      }
      const existingUsers = await UsersRepository.findAll()
      if (existingUsers.some((u) => u.email === data.email && u.id !== id)) {
        throw new BusinessError('Email already exists')
      }
    }

    const updated = await UsersRepository.update(id, data)
    if (!updated) {
      throw new BusinessError('User not found')
    }
    return updated
  }

  static async suspendUser(id: string) {
    const updated = await UsersRepository.update(id, { status: 'suspended' })
    if (!updated) {
      throw new BusinessError('User not found')
    }
    return updated
  }
}
