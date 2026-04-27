import { IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  name!: string
  email!: string
  password!: string
  role?: string
  status?: string

  @IsOptional()
  @IsString()
  avatar_url?: string
}
