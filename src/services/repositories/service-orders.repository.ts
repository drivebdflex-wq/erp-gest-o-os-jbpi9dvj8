import { createRepository } from './core/base.repository'
import type {
  ServiceOrder,
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO,
} from './types/service-orders'

const MOCK_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    client_id: '33333333-3333-3333-3333-333333333333',
    technician_id: '44444444-4444-4444-4444-444444444444',
    status: 'pending',
    priority: 'high',
    description: 'Annual HVAC maintenance and inspection.',
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    deadline_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    sla_status: 'within_sla',
    total_duration_minutes: 0,
    latitude: -23.5505,
    longitude: -46.6333,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    client_id: '33333333-3333-3333-3333-333333333333',
    technician_id: '44444444-4444-4444-4444-444444444444',
    status: 'in_progress',
    priority: 'medium',
    description: 'Elevator system routine check.',
    scheduled_at: new Date().toISOString(),
    deadline_at: new Date(Date.now() + 86400000 * 1).toISOString(),
    sla_status: 'warning',
    total_duration_minutes: 45,
    latitude: -23.551,
    longitude: -46.634,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const ServiceOrdersRepository = createRepository<
  ServiceOrder,
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO
>('service_orders', MOCK_SERVICE_ORDERS)
