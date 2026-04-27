import { Controller, Post, Body, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    if (
      !loginDto.email ||
      typeof loginDto.email !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(loginDto.email)
    ) {
      throw new BadRequestException('Invalid email format')
    }

    if (
      !loginDto.password ||
      typeof loginDto.password !== 'string' ||
      loginDto.password.length < 6
    ) {
      throw new BadRequestException(
        'Password must be a string with a minimum length of 6 characters',
      )
    }

    return this.authService.login(loginDto)
  }
}
