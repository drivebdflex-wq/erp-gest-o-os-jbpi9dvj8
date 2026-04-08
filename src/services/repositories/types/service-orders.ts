import {
  ID,
  Timestamps,
  ServiceOrderStatus,
  ServiceOrderPriority,
  SLAStatus,
  ServiceOrderServiceType,
} from './common'

export interface ServiceOrderAttachment extends Timestamps {
  id: ID
  service_order_id: ID
  file_name: string
  file_url: string
  uploaded_by?: ID | null
}

export interface ServiceOrder extends Timestamps {
  id: ID
  client_id: ID
  contract_id?: ID | null
  unit_id?: ID | null
  technician_id?: ID | null
  team_id?: ID | null
  vehicle_id?: ID | null
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  service_type: ServiceOrderServiceType
  description?: string
  service_code?: string
  service_value?: number
  scheduled_at?: string
  deadline_at?: string
  sla_status: SLAStatus
  started_at?: string
  last_resumed_at?: string | null
  paused_at?: string
  finished_at?: string
  total_duration_minutes: number
  estimated_duration_minutes?: number
  labor_cost?: number
  latitude?: number
  longitude?: number
  customer_signature_url?: string
}

export interface CreateServiceOrderDTO {
  client_id: ID
  contract_id?: ID | null
  unit_id: ID
  technician_id?: ID | null
  team_id?: ID | null
  vehicle_id?: ID | null
  status?: ServiceOrderStatus
  priority?: ServiceOrderPriority
  service_type: ServiceOrderServiceType
  description?: string
  service_code?: string
  service_value?: number
  scheduled_at?: string
  deadline_at?: string
  latitude?: number
  longitude?: number
  customer_signature_url?: string
  labor_cost?: number
  estimated_duration_minutes?: number
}

export type UpdateServiceOrderDTO = Partial<CreateServiceOrderDTO> & {
  sla_status?: SLAStatus
  started_at?: string
  last_resumed_at?: string | null
  paused_at?: string
  finished_at?: string
  total_duration_minutes?: number
}
