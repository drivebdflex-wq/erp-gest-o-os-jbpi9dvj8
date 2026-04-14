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

const MOCK_MATERIALS: Material[] = [
  {
    id: 'mat-1111-1111',
    name: 'Cabo de Rede Cat6',
    unit_type: 'Metros',
    sku: 'CABO-CAT6-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mat-2222-2222',
    name: 'Conector RJ45',
    unit_type: 'Unidade',
    sku: 'CON-RJ45-02',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const MOCK_INVENTORY: Inventory[] = [
  {
    id: 'inv-1111-1111',
    material_id: 'mat-1111-1111',
    quantity: 500,
    location: 'Almoxarifado Central',
    min_stock_level: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-2222-2222',
    material_id: 'mat-2222-2222',
    quantity: 1000,
    location: 'Almoxarifado Central',
    min_stock_level: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const MaterialsRepository = createRepository<Material, CreateMaterialDTO, UpdateMaterialDTO>(
  'materials',
  MOCK_MATERIALS,
)
export const InventoryRepository = createRepository<
  Inventory,
  CreateInventoryDTO,
  UpdateInventoryDTO
>('inventory', MOCK_INVENTORY)
export const ServiceOrderMaterialsRepository = createRepository<
  ServiceOrderMaterial,
  CreateServiceOrderMaterialDTO,
  Partial<CreateServiceOrderMaterialDTO>
>('service_order_materials', [])
