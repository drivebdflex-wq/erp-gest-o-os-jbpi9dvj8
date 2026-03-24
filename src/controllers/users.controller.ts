import { UsersService } from '@/services/business/users.service'
import { ResponseHandler } from './core/response.handler'
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto'

export class UsersController {
  static async create(body: unknown) {
    try {
      const data = CreateUserDto.parse(body)
      const result = await UsersService.createUser(data as any)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findAll() {
    try {
      const result = await UsersService.findAll()
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findById(id: string) {
    try {
      const result = await UsersService.findById(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error, 404)
    }
  }

  static async update(id: string, body: unknown) {
    try {
      const data = UpdateUserDto.parse(body)
      const result = await UsersService.updateUser(id, data)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async suspend(id: string) {
    try {
      const result = await UsersService.suspendUser(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async delete(id: string) {
    try {
      const result = await UsersService.deleteUser(id)
      return ResponseHandler.success({ deleted: result })
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
