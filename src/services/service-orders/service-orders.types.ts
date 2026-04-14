export type ServiceOrderStatus = 'pending' | 'in_progress' | 'completed'

export interface ServiceOrder {
  id: string
  client_id: string
  technician_id?: string | null
  status: ServiceOrderStatus
  priority: string
  description: string
  scheduled_at?: string
  created_at: string
  updated_at: string
  // Extendable fields for UI features
  customer_signature_url?: string
  sla_status?: string
  total_duration_minutes?: number
}

export interface CreateServiceOrderDTO {
  client_id: string
  technician_id?: string | null
  priority?: string
  description: string
  scheduled_at?: string
}
