import { ChecklistsService } from '@/services/business/checklists.service'
import { ResponseHandler } from './core/response.handler'
import {
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateChecklistResponseDto,
} from './dtos/checklists.dto'

export class ChecklistsController {
  static async create(body: unknown) {
    try {
      const data = CreateChecklistDto.parse(body)
      const result = await ChecklistsService.createChecklist(data)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findAll() {
    try {
      const result = await ChecklistsService.findAllChecklists()
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async findById(id: string) {
    try {
      const result = await ChecklistsService.findChecklistById(id)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error, 404)
    }
  }

  static async update(id: string, body: unknown) {
    try {
      const data = UpdateChecklistDto.parse(body)
      const result = await ChecklistsService.updateChecklist(id, data)
      return ResponseHandler.success(result)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async delete(id: string) {
    try {
      const result = await ChecklistsService.deleteChecklist(id)
      return ResponseHandler.success({ deleted: result })
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }

  static async addResponse(body: unknown) {
    try {
      const data = CreateChecklistResponseDto.parse(body)
      const result = await ChecklistsService.addResponse(data)
      return ResponseHandler.success(result, 201)
    } catch (error) {
      return ResponseHandler.error(error)
    }
  }
}
