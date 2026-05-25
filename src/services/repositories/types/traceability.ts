import { ID, Timestamps } from './common'

export interface Audit extends Timestamps {
  id: ID
  table_name: string
  record_id: ID
  action: string
  old_value?: any
  new_value?: any
  user_id?: ID | null
}

export interface CreateAuditDTO {
  table_name: string
  record_id: ID
  action: string
  old_value?: any
  new_value?: any
  user_id?: ID | null
}

export interface Log extends Timestamps {
  id: ID
  level: string
  message: string
  context?: any
}

export interface CreateLogDTO {
  level: string
  message: string
  context?: any
}
