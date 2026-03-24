import { MaterialsService } from '@/services/business/materials.service'
import { ResponseHandler } from './core/response.handler'
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  AssignMaterialDto,
  RestockMaterialDto,
} from './dtos/materials.dto'

export class MaterialsController {
  static async create(body: unknown) {
    try {
      const data = CreateMaterialDto.parse(body)
      const result = await MaterialsService.createMaterial(data)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findAll() {
    try {
      const result = await MaterialsService.findAll()
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findById(id: string) {
    try {
      const result = await MaterialsService.findById(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error, 404)
    }
  }

  static async update(id: string, body: unknown) {
    try {
      const data = UpdateMaterialDto.parse(body)
      const result = await MaterialsService.updateMaterial(id, data)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async delete(id: string) {
    try {
      const result = await MaterialsService.deleteMaterial(id)
      return ResponseHandler.success({ deleted: result })
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async assignToOrder(id: string, body: unknown) {
    try {
      const data = AssignMaterialDto.parse(body)
      const result = await MaterialsService.assignMaterialToOrder(
        data.serviceOrderId,
        id,
        data.quantity,
      )
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async restock(id: string, body: unknown) {
    try {
      const data = RestockMaterialDto.parse(body)
      const result = await MaterialsService.restockMaterial(id, data.quantity)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
