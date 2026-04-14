export type ID = string

export interface Timestamps {
  created_at: string
  updated_at: string
}

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

export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ServiceOrderServiceType =
  | 'eletrica'
  | 'hidraulica'
  | 'civil'
  | 'serralheria'
  | 'marmoraria'
  | 'marcenaria'

export type SLAStatus = 'within_sla' | 'warning' | 'breached'
export type ChecklistStatus = 'pending' | 'in_progress' | 'completed'
