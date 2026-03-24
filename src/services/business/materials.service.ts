import {
  InventoryRepository,
  ServiceOrderMaterialsRepository,
} from '../repositories/materials.repository'
import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { BusinessError } from './errors'

export class MaterialsService {
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
