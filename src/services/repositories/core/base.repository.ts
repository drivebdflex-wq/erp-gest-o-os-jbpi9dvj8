import { supabase, isMock } from '@/lib/supabase'
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
        if (isMock) return [...inMemoryData]
        return await supabase.request<T[]>(`${tableName}?select=*`)
      } catch (error) {
        console.error(`[Repository Error] findAll on ${tableName}:`, error)
        throw new BusinessError(`Failed to fetch records for ${tableName}`)
      }
    },

    async findById(id: ID): Promise<T | null> {
      try {
        if (isMock) {
          return inMemoryData.find((item) => item.id === id) || null
        }
        const result = await supabase.request<T[]>(`${tableName}?id=eq.${id}&select=*`)
        return result.length > 0 ? result[0] : null
      } catch (error) {
        console.error(`[Repository Error] findById on ${tableName} (id: ${id}):`, error)
        throw new BusinessError(`Failed to fetch record ${id} from ${tableName}`)
      }
    },

    async create(data: CreateDTO): Promise<T> {
      try {
        let newItem: T
        if (isMock) {
          newItem = {
            id: crypto.randomUUID(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as unknown as T
          inMemoryData.push(newItem)
        } else {
          const result = await supabase.request<T[]>(tableName, {
            method: 'POST',
            body: JSON.stringify(data),
          })
          newItem = result[0]
        }
        logAudit('CREATE', newItem.id, null, newItem)
        return newItem
      } catch (error) {
        console.error(`[Repository Error] create on ${tableName}:`, error)
        throw new BusinessError(`Failed to create record in ${tableName}`)
      }
    },

    async update(id: ID, data: UpdateDTO): Promise<T | null> {
      try {
        let oldItem: T | null = null
        let updatedItem: T | null = null

        if (isMock) {
          const index = inMemoryData.findIndex((item) => item.id === id)
          if (index === -1) return null
          oldItem = { ...inMemoryData[index] }
          inMemoryData[index] = {
            ...inMemoryData[index],
            ...data,
            updated_at: new Date().toISOString(),
          }
          updatedItem = inMemoryData[index]
        } else {
          const current = await supabase.request<T[]>(`${tableName}?id=eq.${id}&select=*`)
          if (current.length > 0) oldItem = current[0]

          const result = await supabase.request<T[]>(`${tableName}?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
          if (result.length > 0) updatedItem = result[0]
        }

        if (updatedItem && oldItem) {
          logAudit('UPDATE', id, oldItem, updatedItem)
        }
        return updatedItem
      } catch (error) {
        console.error(`[Repository Error] update on ${tableName} (id: ${id}):`, error)
        throw new BusinessError(`Failed to update record ${id} in ${tableName}`)
      }
    },

    async delete(id: ID): Promise<boolean> {
      try {
        let deletedItem: T | null = null

        if (isMock) {
          const index = inMemoryData.findIndex((item) => item.id === id)
          if (index !== -1) {
            deletedItem = inMemoryData[index]
            inMemoryData.splice(index, 1)
          }
        } else {
          const current = await supabase.request<T[]>(`${tableName}?id=eq.${id}&select=*`)
          if (current.length > 0) deletedItem = current[0]
          await supabase.request<void>(`${tableName}?id=eq.${id}`, {
            method: 'DELETE',
          })
        }

        if (deletedItem) {
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
