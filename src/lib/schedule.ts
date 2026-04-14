import { Order } from '@/stores/useAppStore'

export const BUFFER_MINUTES = 30

export function checkConflict(
  orders: Order[],
  teamId: string | null | undefined,
  technicianId: string | null | undefined,
  start: Date,
  durationMinutes: number,
  excludeOrderId?: string,
) {
  if (!teamId && !technicianId) return false

  const newStart = start.getTime()
  const newEnd = newStart + durationMinutes * 60000

  const relevantOrders = orders.filter(
    (o) =>
      o.id !== excludeOrderId &&
      o.scheduledAt &&
      ['pending', 'scheduled', 'in_progress', 'deslocamento', 'paused'].includes(o.status) &&
      ((teamId && o.teamId === teamId) || (technicianId && o.technicianId === technicianId)),
  )

  for (const o of relevantOrders) {
    const oStart = new Date(o.scheduledAt!).getTime()
    const oDuration = o.estimatedDurationMinutes || 60
    const oEnd = oStart + oDuration * 60000

    // Check overlap with mandatory buffer between services
    // The new service and existing service must be separated by at least BUFFER_MINUTES
    if (newStart < oEnd + BUFFER_MINUTES * 60000 && newEnd + BUFFER_MINUTES * 60000 > oStart) {
      return true
    }
  }
  return false
}
