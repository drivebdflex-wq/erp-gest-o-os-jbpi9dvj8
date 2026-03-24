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

const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: 'chk-1111-1111',
    title: 'Manutenção Preventiva HVAC',
    description: 'Checklist padrão para manutenção de ar condicionado',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const MOCK_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'item-1111-1111',
    checklist_id: 'chk-1111-1111',
    label: 'Verificar filtros de ar',
    field_type: 'boolean',
    is_required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-2222-2222',
    checklist_id: 'chk-1111-1111',
    label: 'Medição de gás refrigerante',
    field_type: 'number',
    is_required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const MOCK_SO_CHECKLISTS: ServiceOrderChecklist[] = [
  {
    id: 'sochk-1111-1111',
    service_order_id: '55555555-5555-5555-5555-555555555555',
    checklist_id: 'chk-1111-1111',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const ChecklistsRepository = createRepository<
  Checklist,
  CreateChecklistDTO,
  UpdateChecklistDTO
>('checklists', MOCK_CHECKLISTS)
export const ChecklistItemsRepository = createRepository<
  ChecklistItem,
  CreateChecklistItemDTO,
  UpdateChecklistItemDTO
>('checklist_items', MOCK_CHECKLIST_ITEMS)
export const ServiceOrderChecklistsRepository = createRepository<
  ServiceOrderChecklist,
  CreateServiceOrderChecklistDTO,
  UpdateServiceOrderChecklistDTO
>('service_order_checklists', MOCK_SO_CHECKLISTS)
export const ChecklistResponsesRepository = createRepository<
  ChecklistResponse,
  CreateChecklistResponseDTO,
  UpdateChecklistResponseDTO
>('checklist_responses', [])
