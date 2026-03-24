import { ID, Timestamps, ServiceOrderStatus, ServiceOrderPriority, SLAStatus } from './common'

export interface ServiceOrder extends Timestamps {
  id: ID
  client_id: ID
  technician_id?: ID | null
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  description?: string
  scheduled_at?: string
  deadline_at?: string
  sla_status: SLAStatus
  started_at?: string
  paused_at?: string
  finished_at?: string
  total_duration_minutes: number
  latitude?: number
  longitude?: number
  customer_signature_url?: string
}

export interface CreateServiceOrderDTO {
  client_id: ID
  technician_id?: ID | null
  status?: ServiceOrderStatus
  priority?: ServiceOrderPriority
  description?: string
  scheduled_at?: string
  deadline_at?: string
  latitude?: number
  longitude?: number
  customer_signature_url?: string
}

export type UpdateServiceOrderDTO = Partial<CreateServiceOrderDTO> & {
  sla_status?: SLAStatus
  started_at?: string
  paused_at?: string
  finished_at?: string
  total_duration_minutes?: number
}
