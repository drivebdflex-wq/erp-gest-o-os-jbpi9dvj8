import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import {
  NotificationsRepository,
  Notification,
} from '@/services/repositories/notifications.repository'
import { ServiceOrdersRepository } from '@/services/repositories/service-orders.repository'
import { ContractsRepository } from '@/services/repositories/contracts.repository'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  fetchNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationState | undefined>(undefined)

const getDiffDays = (targetDate: string) => {
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(async () => {
    try {
      const all = await NotificationsRepository.findAll()
      setNotifications(
        all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      )
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [])

  const generateNotifications = useCallback(async () => {
    try {
      const orders = await ServiceOrdersRepository.findAll()
      const contracts = await ContractsRepository.findAll()
      const existing = await NotificationsRepository.findAll()

      const exists = (ref: string, code: string) =>
        existing.some((n) => n.reference_id === ref && n.event_code === code)

      const create = async (n: Partial<Notification>) => {
        if (!exists(n.reference_id!, n.event_code!)) {
          await NotificationsRepository.create({ ...n, is_read: false } as any)
        }
      }

      // Generate for Service Orders
      for (const o of orders) {
        if (o.status === 'completed' || o.status === 'cancelled' || !o.deadline_at) continue
        const diff = getDiffDays(o.deadline_at)
        const shortId = o.id.substring(0, 8).toUpperCase()

        if (diff === 0) {
          await create({
            type: 'service_order',
            level: 'warning',
            message: `OS #${shortId} vence hoje`,
            reference_id: o.id,
            event_code: 'so_due_today',
          })
        } else if (diff === -1) {
          await create({
            type: 'service_order',
            level: 'critical',
            message: `OS #${shortId} vencida`,
            reference_id: o.id,
            event_code: 'so_past_due',
          })
        } else if (diff <= -2) {
          await create({
            type: 'service_order',
            level: 'warning',
            message: `OS #${shortId} atrasada há ${Math.abs(diff)} dias`,
            reference_id: o.id,
            event_code: `so_past_due_${Math.abs(diff)}`,
          })
        }
      }

      // Generate for Contracts and Financial Adjustments
      for (const c of contracts) {
        if (c.end_date) {
          const diff = getDiffDays(c.end_date)
          if (diff === 30) {
            await create({
              type: 'contract',
              level: 'info',
              message: `Contrato ${c.name} vence em 30 dias`,
              reference_id: c.id,
              event_code: 'contract_end_30',
            })
          } else if (diff === 0) {
            await create({
              type: 'contract',
              level: 'critical',
              message: `Contrato ${c.name} vence hoje`,
              reference_id: c.id,
              event_code: 'contract_end_today',
            })
          } else if (diff < 0) {
            await create({
              type: 'contract',
              level: 'critical',
              message: `Contrato ${c.name} está vencido`,
              reference_id: c.id,
              event_code: 'contract_expired',
            })
          }
        }

        if (c.next_adjustment_date) {
          const diff = getDiffDays(c.next_adjustment_date)
          if (diff === 7) {
            await create({
              type: 'financial',
              level: 'info',
              message: `Contrato ${c.name} precisa de reajuste em breve`,
              reference_id: c.id,
              event_code: 'finance_adj_7',
            })
          } else if (diff === 0) {
            await create({
              type: 'financial',
              level: 'warning',
              message: `Contrato ${c.name} precisa ser reajustado hoje`,
              reference_id: c.id,
              event_code: 'finance_adj_today',
            })
          }
        }
      }

      await fetchNotifications()
    } catch (error) {
      console.error('Error generating notifications:', error)
    }
  }, [fetchNotifications])

  useEffect(() => {
    generateNotifications()
    const interval = setInterval(generateNotifications, 60000)
    return () => clearInterval(interval)
  }, [generateNotifications])

  const markAsRead = async (id: string) => {
    await NotificationsRepository.update(id, { is_read: true })
    await fetchNotifications()
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read)
    for (const n of unread) {
      await NotificationsRepository.update(n.id, { is_read: true })
    }
    await fetchNotifications()
  }

  return React.createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        unreadCount: notifications.filter((n) => !n.is_read).length,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      },
    },
    children,
  )
}

export default function useNotificationStore() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotificationStore must be used within a NotificationProvider')
  return context
}
