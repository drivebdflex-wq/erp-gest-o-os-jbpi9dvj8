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

export interface ServiceOrderItem extends Timestamps {
  id: ID
  service_order_id: ID
  description: string
  unit: string
  quantity: number
  unit_price: number
  total_price: number
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
  latitude?: number
  longitude?: number
  customer_signature_url?: string

  order_number?: string
  call_code?: string
  asset_number?: string
  client_unit?: string
  address?: string
  floor?: string
  distance_km?: number
  environment?: string
  criticality?: string
  is_incident?: boolean
  requested_by?: string
  requester_registration?: string
  requester_phone?: string
  situation_code?: number
  displacement_cost?: number
  labor_cost?: number
  material_cost?: number
  total_cost?: number
  notes?: string
  items?: ServiceOrderItem[]

  sector?: string
  reference_point?: string
  root_cause?: string
  supervisor_signature_url?: string
  km_driven?: number

  diagnostics?: string
  cost_center?: string
  billing_status?: string
  approval_status?: string
  technician_signature_url?: string
  client_signature_url?: string

  ticket_number?: string
  dependency?: string
  agency_code?: string
  os_type?: string
  warranty?: boolean
  opening_date?: string
  acceptance_date?: string
  client_request?: string
  procedures_executed?: string
  pending_issues?: string
  risks_found?: string
  general_observations?: string
  technical_recommendations?: string
  operational_checklist?: string
  supervisor_id?: string
  vehicle_used?: string
  tools_used?: string
  displacement_time?: number
  discount?: number
  client_signature_name?: string
  client_signature_position?: string
  internal_code?: string
  billing_type?: string
  supervisor_approval?: boolean
  client_approval?: boolean
  is_billed?: boolean
}

export interface CreateServiceOrderDTO {
  client_id: ID
  technician_id?: ID | null
  status?: ServiceOrderStatus
  priority?: ServiceOrderPriority
  description?: string
  order_number?: string
  call_code?: string
  asset_number?: string
  client_unit?: string
  address?: string
  floor?: string
  distance_km?: number
  environment?: string
  criticality?: string
  is_incident?: boolean
  requested_by?: string
  requester_registration?: string
  requester_phone?: string
  situation_code?: number
  displacement_cost?: number
  labor_cost?: number
  material_cost?: number
  total_cost?: number
  notes?: string
  items?: ServiceOrderItem[]
  diagnostics?: string
  sector?: string
  reference_point?: string
  root_cause?: string
  supervisor_signature_url?: string
  km_driven?: number
  cost_center?: string
  billing_status?: string
  approval_status?: string

  ticket_number?: string
  dependency?: string
  agency_code?: string
  os_type?: string
  warranty?: boolean
  opening_date?: string
  acceptance_date?: string
  client_request?: string
  procedures_executed?: string
  pending_issues?: string
  risks_found?: string
  general_observations?: string
  technical_recommendations?: string
  operational_checklist?: string
  supervisor_id?: string
  vehicle_used?: string
  tools_used?: string
  displacement_time?: number
  discount?: number
  client_signature_name?: string
  client_signature_position?: string
  internal_code?: string
  billing_type?: string
  supervisor_approval?: boolean
  client_approval?: boolean
  is_billed?: boolean
}

export type UpdateServiceOrderDTO = Partial<CreateServiceOrderDTO> & {
  sla_status?: SLAStatus
  started_at?: string
  last_resumed_at?: string | null
  paused_at?: string
  finished_at?: string
  total_duration_minutes?: number
  sector?: string
  reference_point?: string
  root_cause?: string
  supervisor_signature_url?: string
  km_driven?: number
}
