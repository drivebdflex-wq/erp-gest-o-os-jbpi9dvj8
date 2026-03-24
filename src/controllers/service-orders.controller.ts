import { ServiceOrdersService } from '@/services/business/service-orders.service'
import { ResponseHandler } from './core/response.handler'
import { AuthGuard } from './core/auth.guard'
import {
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  UpdateStatusDto,
} from './dtos/service-orders.dto'

export class ServiceOrdersController {
  static async create(body: unknown, token?: string) {
    try {
      const ctx = await AuthGuard.verify(token)
      AuthGuard.requireRoles(ctx, ['Administrator', 'Supervisor'])
      const data = CreateServiceOrderDto.parse(body)
      const result = await ServiceOrdersService.create(data, ctx.userId)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findAll(token?: string) {
    try {
      const ctx = await AuthGuard.verify(token)
      const result = await ServiceOrdersService.findAll(ctx.userId)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findById(id: string, token?: string) {
    try {
      const ctx = await AuthGuard.verify(token)
      const result = await ServiceOrdersService.findById(id, ctx.userId)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error, 404)
    }
  }

  static async update(id: string, body: unknown, token?: string) {
    try {
      const ctx = await AuthGuard.verify(token)
      const data = UpdateServiceOrderDto.parse(body)
      const result = await ServiceOrdersService.update(id, data, ctx.userId)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async updateStatus(id: string, body: unknown, token?: string) {
    try {
      const ctx = await AuthGuard.verify(token)
      const data = UpdateStatusDto.parse(body)
      const result = await ServiceOrdersService.changeStatus(id, data.status, ctx.userId)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
