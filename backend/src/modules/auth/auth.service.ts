import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { SupabaseService } from '../../supabase.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = { sub: user.id, email: user.email, role: user.role }
    const access_token = this.jwtService.sign(payload)

    const { password_hash, ...userWithoutPassword } = user

    return {
      access_token,
      user: userWithoutPassword,
    }
  }
}
