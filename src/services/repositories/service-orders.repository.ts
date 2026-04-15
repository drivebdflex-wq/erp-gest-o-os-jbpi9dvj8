import { createRepository } from './core/base.repository'
import type {
  ServiceOrder,
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO,
} from './types/service-orders'

export const ServiceOrdersRepository = createRepository<
  ServiceOrder,
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO
>('service_orders', [])
