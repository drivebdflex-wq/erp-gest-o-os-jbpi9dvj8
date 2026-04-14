import { ID, Timestamps } from './common'

export interface Material extends Timestamps {
  id: ID
  name: string
  unit_type?: string
  sku?: string
}

export interface CreateMaterialDTO {
  name: string
  unit_type?: string
  sku?: string
}

export type UpdateMaterialDTO = Partial<CreateMaterialDTO>

export interface Inventory extends Timestamps {
  id: ID
  material_id: ID
  quantity: number
  location?: string
  min_stock_level?: number
}

export interface CreateInventoryDTO {
  material_id: ID
  quantity?: number
  location?: string
  min_stock_level?: number
}

export type UpdateInventoryDTO = Partial<CreateInventoryDTO>

export interface ServiceOrderMaterial extends Timestamps {
  id: ID
  service_order_id: ID
  material_id: ID
  quantity_used: number
}

export interface CreateServiceOrderMaterialDTO {
  service_order_id: ID
  material_id: ID
  quantity_used: number
}

export interface Vehicle extends Timestamps {
  id: ID
  plate: string
  model?: string
  brand?: string
  technician_id?: ID | null
}

export interface CreateVehicleDTO {
  plate: string
  model?: string
  brand?: string
  technician_id?: ID | null
}

export type UpdateVehicleDTO = Partial<CreateVehicleDTO>
