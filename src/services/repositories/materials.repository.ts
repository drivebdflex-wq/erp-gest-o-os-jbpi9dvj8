import { createRepository } from './core/base.repository'
import type {
  Material,
  CreateMaterialDTO,
  UpdateMaterialDTO,
  Inventory,
  CreateInventoryDTO,
  UpdateInventoryDTO,
  ServiceOrderMaterial,
  CreateServiceOrderMaterialDTO,
} from './types/resources'

export const MaterialsRepository = createRepository<Material, CreateMaterialDTO, UpdateMaterialDTO>(
  'materials',
  [],
)
export const InventoryRepository = createRepository<
  Inventory,
  CreateInventoryDTO,
  UpdateInventoryDTO
>('inventory', [])
export const ServiceOrderMaterialsRepository = createRepository<
  ServiceOrderMaterial,
  CreateServiceOrderMaterialDTO,
  Partial<CreateServiceOrderMaterialDTO>
>('service_order_materials', [])
