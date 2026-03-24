import { createRepository } from './core/base.repository'
import type {
  Checklist,
  CreateChecklistDTO,
  UpdateChecklistDTO,
  ChecklistItem,
  CreateChecklistItemDTO,
  UpdateChecklistItemDTO,
  ServiceOrderChecklist,
  CreateServiceOrderChecklistDTO,
  UpdateServiceOrderChecklistDTO,
  ChecklistResponse,
  CreateChecklistResponseDTO,
  UpdateChecklistResponseDTO,
} from './types/quality'

export const ChecklistsRepository = createRepository<
  Checklist,
  CreateChecklistDTO,
  UpdateChecklistDTO
>('checklists', [])
export const ChecklistItemsRepository = createRepository<
  ChecklistItem,
  CreateChecklistItemDTO,
  UpdateChecklistItemDTO
>('checklist_items', [])
export const ServiceOrderChecklistsRepository = createRepository<
  ServiceOrderChecklist,
  CreateServiceOrderChecklistDTO,
  UpdateServiceOrderChecklistDTO
>('service_order_checklists', [])
export const ChecklistResponsesRepository = createRepository<
  ChecklistResponse,
  CreateChecklistResponseDTO,
  UpdateChecklistResponseDTO
>('checklist_responses', [])
