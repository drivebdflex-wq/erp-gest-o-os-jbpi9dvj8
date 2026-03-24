import {
  ServiceOrderChecklistsRepository,
  ChecklistResponsesRepository,
  ChecklistItemsRepository,
  ChecklistsRepository,
} from '../repositories/checklists.repository'
import type {
  CreateChecklistResponseDTO,
  CreateChecklistDTO,
  UpdateChecklistDTO,
} from '../repositories/types/quality'
import { BusinessError } from './errors'

export class ChecklistsService {
  static async createChecklist(data: CreateChecklistDTO) {
    return ChecklistsRepository.create(data)
  }

  static async findAllChecklists() {
    return ChecklistsRepository.findAll()
  }

  static async findChecklistById(id: string) {
    const checklist = await ChecklistsRepository.findById(id)
    if (!checklist) {
      throw new BusinessError('Checklist not found')
    }
    return checklist
  }

  static async updateChecklist(id: string, data: UpdateChecklistDTO) {
    const updated = await ChecklistsRepository.update(id, data)
    if (!updated) {
      throw new BusinessError('Checklist not found')
    }
    return updated
  }

  static async deleteChecklist(id: string) {
    const deleted = await ChecklistsRepository.delete(id)
    if (!deleted) {
      throw new BusinessError('Checklist not found')
    }
    return true
  }

  static async addResponse(data: CreateChecklistResponseDTO) {
    const soChecklist = await ServiceOrderChecklistsRepository.findById(
      data.service_order_checklist_id,
    )
    if (!soChecklist) {
      throw new BusinessError('Service order checklist not found')
    }

    if (soChecklist.status === 'completed') {
      throw new BusinessError('Checklist is already completed')
    }

    const item = await ChecklistItemsRepository.findById(data.checklist_item_id)
    if (!item) {
      throw new BusinessError('Checklist item not found')
    }

    if (item.checklist_id !== soChecklist.checklist_id) {
      throw new BusinessError('Item does not belong to this checklist')
    }

    const response = await ChecklistResponsesRepository.create(data)

    const items = await ChecklistItemsRepository.findAll()
    const checklistItems = items.filter(
      (i) => i.checklist_id === soChecklist.checklist_id && i.is_required,
    )

    const responses = await ChecklistResponsesRepository.findAll()
    const soResponses = responses.filter((r) => r.service_order_checklist_id === soChecklist.id)

    const allRequiredResponded = checklistItems.every((reqItem) =>
      soResponses.some((r) => r.checklist_item_id === reqItem.id),
    )

    if (allRequiredResponded && soChecklist.status !== 'completed') {
      await ServiceOrderChecklistsRepository.update(soChecklist.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
    } else if (soChecklist.status === 'pending') {
      await ServiceOrderChecklistsRepository.update(soChecklist.id, {
        status: 'in_progress',
      })
    }

    return response
  }
}
