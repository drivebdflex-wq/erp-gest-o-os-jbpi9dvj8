import { ServiceOrdersService } from '@/services/service-orders/service-orders.service'
import { ResponseHandler } from './core/response.handler'
import { AuthGuard } from './core/auth.guard'
import { CreateServiceOrderDto, UpdateStatusDto } from './dtos/service-orders.dto'

export class ServiceOrdersController {
  static async remove(id: string, token?: string) {
    try {
      await AuthGuard.verify(token)
      const result = await ServiceOrdersService.delete(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async create(body: unknown, token?: string) {
    try {
      const ctx = await AuthGuard.verify(token)
      AuthGuard.requireRoles(ctx, ['Administrator', 'Supervisor'])
      const data = CreateServiceOrderDto.parse(body)
      const result = await ServiceOrdersService.createServiceOrder(data as any)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findAll(token?: string) {
    try {
      await AuthGuard.verify(token)
      const result = await ServiceOrdersService.getServiceOrders()
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findById(id: string, token?: string) {
    try {
      await AuthGuard.verify(token)
      const result = await ServiceOrdersService.getServiceOrderById(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error, 404)
    }
  }

  static async update(id: string, body: unknown, token?: string) {
    try {
      await AuthGuard.verify(token)
      console.log('Payload recebido:', body)
      const result = await ServiceOrdersService.update(id, body as any)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async updateStatus(id: string, body: unknown, token?: string) {
    try {
      await AuthGuard.verify(token)
      const data = UpdateStatusDto.parse(body)
      const result = await ServiceOrdersService.updateServiceOrderStatus(id, data.status)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
