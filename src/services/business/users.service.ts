import { UsersRepository, UserRolesRepository } from '../repositories/users.repository'
import { BusinessError } from './errors'
import { bcrypt } from '@/lib/bcrypt'

const omitPassword = (user: any) => {
  if (!user) return user
  const { password_hash, ...rest } = user
  return rest
}

export class UsersService {
  static async findAll() {
    const users = await UsersRepository.findAll()
    return users.map(omitPassword)
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

  static async createUser(data: any) {
    if (!data.email || !data.email.includes('@')) {
      throw new BusinessError('Invalid email format')
    }
    if (!data.password || data.password.length < 6) {
      throw new BusinessError('Password must be at least 6 characters')
    }

    const existingUsers = await UsersRepository.findAll()
    if (existingUsers.some((u) => u.email === data.email)) {
      throw new BusinessError('Email already exists')
    }

    const password_hash = await bcrypt.hash(data.password, 10)

    const newUser = {
      name: data.name,
      email: data.email,
      password_hash,
      status: data.status || 'active',
    }

    const created = await UsersRepository.create(newUser as any)

    if (data.role) {
      await UserRolesRepository.create({
        user_id: created.id,
        role_id: data.role,
      } as any)
    }

    return omitPassword(created)
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
