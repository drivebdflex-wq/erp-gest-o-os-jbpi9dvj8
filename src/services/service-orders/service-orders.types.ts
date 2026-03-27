export type ServiceOrderStatus =
  | 'draft'
  | 'pending'
  | 'scheduled'
  | 'deslocamento'
  | 'in_progress'
  | 'paused'
  | 'in_audit'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export interface ServiceOrder {
  id: string
  client_id: string
  technician_id?: string | null
  status: ServiceOrderStatus
  priority: string
  service_type: string
  description: string
  scheduled_at?: string
  started_at?: string
  created_at: string
  updated_at: string
  customer_signature_url?: string
  sla_status?: string
  total_duration_minutes?: number
}

export interface CreateServiceOrderDTO {
  client_id: string
  technician_id?: string | null
  priority?: string
  service_type: string
  description: string
  scheduled_at?: string
}
