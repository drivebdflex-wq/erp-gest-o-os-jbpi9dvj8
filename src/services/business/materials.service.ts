import {
  InventoryRepository,
  ServiceOrderMaterialsRepository,
  MaterialsRepository,
} from '../repositories/materials.repository'
import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { BusinessError } from './errors'
import type { CreateMaterialDTO, UpdateMaterialDTO } from '../repositories/types/resources'

export class MaterialsService {
  static async findAll() {
    return MaterialsRepository.findAll()
  }

  static async findById(id: string) {
    const material = await MaterialsRepository.findById(id)
    if (!material) {
      throw new BusinessError('Material not found')
    }
    return material
  }

  static async createMaterial(data: CreateMaterialDTO) {
    return MaterialsRepository.create(data)
  }

  static async updateMaterial(id: string, data: UpdateMaterialDTO) {
    const updated = await MaterialsRepository.update(id, data)
    if (!updated) {
      throw new BusinessError('Material not found')
    }
    return updated
  }

  static async deleteMaterial(id: string) {
    const deleted = await MaterialsRepository.delete(id)
    if (!deleted) {
      throw new BusinessError('Material not found')
    }
    return true
  }

  static async assignMaterialToOrder(serviceOrderId: string, materialId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BusinessError('Quantity must be greater than zero')
    }

    const order = await ServiceOrdersRepository.findById(serviceOrderId)
    if (!order) {
      throw new BusinessError('Service order not found')
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BusinessError('Cannot assign materials to a completed or cancelled service order')
    }

    const inventories = await InventoryRepository.findAll()
    const inventory = inventories.find((i) => i.material_id === materialId)

    if (!inventory) {
      throw new BusinessError('Material not found in inventory')
    }

    if (inventory.quantity < quantity) {
      throw new BusinessError(
        `Insufficient inventory stock. Available: ${inventory.quantity}, Requested: ${quantity}`,
      )
    }

    await InventoryRepository.update(inventory.id, {
      quantity: inventory.quantity - quantity,
    })

    return ServiceOrderMaterialsRepository.create({
      service_order_id: serviceOrderId,
      material_id: materialId,
      quantity_used: quantity,
    })
  }

  static async restockMaterial(materialId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BusinessError('Quantity must be greater than zero')
    }

    const inventories = await InventoryRepository.findAll()
    const inventory = inventories.find((i) => i.material_id === materialId)

    if (!inventory) {
      throw new BusinessError('Material not found in inventory')
    }

    return InventoryRepository.update(inventory.id, {
      quantity: inventory.quantity + quantity,
    })
  }
}
