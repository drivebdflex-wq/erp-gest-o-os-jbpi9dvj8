import { ID } from '../types/common'
import { useSystemStore } from '@/stores/useSystemStore'
import { repositoryDataMap } from '@/lib/mock-db'
import { BusinessError } from '@/services/business/errors'

export function createRepository<T extends { id: ID }, CreateDTO, UpdateDTO>(
  tableName: string,
  mockData: T[] = [],
) {
  if (!repositoryDataMap[tableName]) {
    repositoryDataMap[tableName] = [...mockData]
  }
  const inMemoryData = repositoryDataMap[tableName]

  const logAudit = (action: any, recordId: ID, oldValue: any, newValue: any) => {
    const savedUser = localStorage.getItem('fieldops_user')
    const user = savedUser ? JSON.parse(savedUser) : null

    useSystemStore.getState().logAudit({
      user_id: user?.id || null,
      user_name: user?.name || 'Sistema',
      action,
      table_name: tableName,
      record_id: String(recordId),
      old_value: oldValue,
      new_value: newValue,
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent,
    })
  }

  return {
    async findAll(): Promise<T[]> {
      try {
        return [...inMemoryData]
      } catch (error) {
        console.error(`[Repository Error] findAll on ${tableName}:`, error)
        throw new BusinessError(`Failed to fetch records for ${tableName}`)
      }
    },

    async findById(id: ID): Promise<T | null> {
      try {
        return inMemoryData.find((item) => item.id === id) || null
      } catch (error) {
        console.error(`[Repository Error] findById on ${tableName} (id: ${id}):`, error)
        throw new BusinessError(`Failed to fetch record ${id} from ${tableName}`)
      }
    },

    async create(data: CreateDTO): Promise<T> {
      try {
        const newItem = {
          id: crypto.randomUUID(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as T
        inMemoryData.push(newItem)

        logAudit('CREATE', newItem.id, null, newItem)
        return newItem
      } catch (error) {
        console.error(`[Repository Error] create on ${tableName}:`, error)
        throw new BusinessError(`Failed to create record in ${tableName}`)
      }
    },

    async update(id: ID, data: UpdateDTO): Promise<T | null> {
      try {
        const index = inMemoryData.findIndex((item) => item.id === id)
        if (index === -1) return null
        const oldItem = { ...inMemoryData[index] }
        inMemoryData[index] = {
          ...inMemoryData[index],
          ...data,
          updated_at: new Date().toISOString(),
        }
        const updatedItem = inMemoryData[index]

        logAudit('UPDATE', id, oldItem, updatedItem)
        return updatedItem
      } catch (error) {
        console.error(`[Repository Error] update on ${tableName} (id: ${id}):`, error)
        throw new BusinessError(`Failed to update record ${id} in ${tableName}`)
      }
    },

    async delete(id: ID): Promise<boolean> {
      try {
        const index = inMemoryData.findIndex((item) => item.id === id)
        if (index !== -1) {
          const deletedItem = inMemoryData[index]
          inMemoryData.splice(index, 1)

          const savedUser = localStorage.getItem('fieldops_user')
          const user = savedUser ? JSON.parse(savedUser) : null

          useSystemStore.getState().addDeletedRecord({
            table_name: tableName,
            record_id: String(id),
            data: deletedItem,
            deleted_by: user?.id || null,
            deleted_by_name: user?.name || 'Sistema',
          })

          logAudit('DELETE', id, deletedItem, null)
          return true
        }
        return false
      } catch (error) {
        console.error(`[Repository Error] delete on ${tableName} (id: ${id}):`, error)
        throw new BusinessError(`Failed to delete record ${id} from ${tableName}`)
      }
    },
  }
}
