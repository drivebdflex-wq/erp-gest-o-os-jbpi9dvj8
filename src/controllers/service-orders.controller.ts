import { ServiceOrdersService } from '@/services/business/service-orders.service'
import { ResponseHandler } from './core/response.handler'
import {
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  UpdateStatusDto,
} from './dtos/service-orders.dto'

export class ServiceOrdersController {
  static async create(body: unknown, userId: string = 'system') {
    try {
      const data = CreateServiceOrderDto.parse(body)
      const result = await ServiceOrdersService.create(data, userId)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findAll() {
    try {
      const result = await ServiceOrdersService.findAll()
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findById(id: string) {
    try {
      const result = await ServiceOrdersService.findById(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error, 404)
    }
  }

  static async update(id: string, body: unknown, userId: string = 'system') {
    try {
      const data = UpdateServiceOrderDto.parse(body)
      const result = await ServiceOrdersService.update(id, data, userId)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async updateStatus(id: string, body: unknown) {
    try {
      const data = UpdateStatusDto.parse(body)
      const result = await ServiceOrdersService.changeStatus(id, data.status, data.userId)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
