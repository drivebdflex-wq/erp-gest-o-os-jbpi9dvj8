import { ID, Timestamps, ChecklistStatus } from './common'

export interface Checklist extends Timestamps {
  id: ID
  title: string
  description?: string
  created_by?: ID | null
}

export interface CreateChecklistDTO {
  title: string
  description?: string
  created_by?: ID | null
}

export type UpdateChecklistDTO = Partial<CreateChecklistDTO>

export interface ChecklistItem extends Timestamps {
  id: ID
  checklist_id: ID
  label: string
  field_type: string
  is_required: boolean
}

export interface CreateChecklistItemDTO {
  checklist_id: ID
  label: string
  field_type: string
  is_required?: boolean
}

export type UpdateChecklistItemDTO = Partial<CreateChecklistItemDTO>

export interface ServiceOrderChecklist extends Timestamps {
  id: ID
  service_order_id: ID
  checklist_id: ID
  status: ChecklistStatus
  completed_at?: string
}

export interface CreateServiceOrderChecklistDTO {
  service_order_id: ID
  checklist_id: ID
  status?: ChecklistStatus
}

export type UpdateServiceOrderChecklistDTO = Partial<CreateServiceOrderChecklistDTO> & {
  completed_at?: string
}

export interface ChecklistResponse extends Timestamps {
  id: ID
  service_order_checklist_id: ID
  checklist_item_id: ID
  response_text?: string
  response_boolean?: boolean
  response_number?: number
  photo_url?: string
}

export interface CreateChecklistResponseDTO {
  service_order_checklist_id: ID
  checklist_item_id: ID
  response_text?: string
  response_boolean?: boolean
  response_number?: number
  photo_url?: string
}

export type UpdateChecklistResponseDTO = Partial<CreateChecklistResponseDTO>

export interface Photo extends Timestamps {
  id: ID
  related_entity_type: string
  related_entity_id: ID
  storage_url: string
  uploaded_by?: ID | null
}

export interface CreatePhotoDTO {
  related_entity_type: string
  related_entity_id: ID
  storage_url: string
  uploaded_by?: ID | null
}

export type UpdatePhotoDTO = Partial<CreatePhotoDTO>
