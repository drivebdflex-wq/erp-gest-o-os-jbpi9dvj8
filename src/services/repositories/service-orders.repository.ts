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
    contract_id: '77777777-7777-7777-7777-777777777777',
    technician_id: 'tech-record-1',
    team_id: null,
    vehicle_id: 'v1',
    status: 'pending',
    priority: 'high',
    service_type: 'eletrica',
    description: 'Annual HVAC maintenance and inspection.',
    scheduled_at: (() => {
      const d = new Date()
      d.setHours(8, 0, 0, 0)
      return d.toISOString()
    })(),
    deadline_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    sla_status: 'within_sla',
    total_duration_minutes: 0,
    estimated_duration_minutes: 120,
    labor_cost: 0,
    latitude: -23.5505,
    longitude: -46.6333,
    last_resumed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    client_id: '33333333-3333-3333-3333-333333333333',
    contract_id: 'contract-2',
    technician_id: null,
    team_id: 'team-alpha',
    vehicle_id: 'v2',
    status: 'in_progress',
    priority: 'medium',
    service_type: 'civil',
    description: 'Elevator system routine check.',
    scheduled_at: (() => {
      const d = new Date()
      d.setHours(10, 30, 0, 0)
      return d.toISOString()
    })(),
    deadline_at: new Date(Date.now() + 86400000 * 1).toISOString(),
    sla_status: 'warning',
    started_at: new Date(Date.now() - 3600000).toISOString(),
    last_resumed_at: new Date(Date.now() - 3600000).toISOString(),
    total_duration_minutes: 45,
    estimated_duration_minutes: 60,
    labor_cost: 0,
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
