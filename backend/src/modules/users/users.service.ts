import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../supabase.service'
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .getClient()
      .from('users')
      .select('id, name, email, status, avatar_url, created_at, updated_at')

    if (error) throw new Error(error.message)
    return data
  }

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto.email || !createUserDto.email.includes('@')) {
      throw new Error('Invalid email format')
    }
    if (!createUserDto.password || createUserDto.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    const password_hash = await bcrypt.hash(createUserDto.password, 10)

    const { data, error } = await this.supabase
      .getClient()
      .from('users')
      .insert([
        {
          name: createUserDto.name,
          email: createUserDto.email,
          password_hash,
          status: createUserDto.status || 'active',
        },
      ])
      .select('id, name, email, status, avatar_url, created_at, updated_at')
      .single()

    if (error) throw new Error(error.message)

    if (createUserDto.role) {
      const { data: roleData } = await this.supabase
        .getClient()
        .from('roles')
        .select('id')
        .eq('name', createUserDto.role)
        .single()

      if (roleData) {
        await this.supabase
          .getClient()
          .from('user_roles')
          .insert([{ user_id: data.id, role_id: roleData.id }])
      }
    }

    return data
  }
}
