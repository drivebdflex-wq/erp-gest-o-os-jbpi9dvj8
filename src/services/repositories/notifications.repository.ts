import { createRepository } from './core/base.repository'

export interface Notification {
  id: string
  type: 'service_order' | 'contract' | 'financial'
  level: 'info' | 'warning' | 'critical'
  message: string
  reference_id: string
  event_code: string
  is_read: boolean
  created_at: string
  updated_at: string
}

const MOCK_NOTIFICATIONS: Notification[] = []

export const NotificationsRepository = createRepository<Notification, any, any>(
  'notifications',
  MOCK_NOTIFICATIONS,
)
