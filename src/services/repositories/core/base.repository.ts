import { supabase, isMock } from '@/lib/supabase'
import { ID } from '../types/common'

export function createRepository<T extends { id: ID }, CreateDTO, UpdateDTO>(
  tableName: string,
  mockData: T[] = [],
) {
  let inMemoryData = [...mockData]

  return {
    async findAll(): Promise<T[]> {
      if (isMock) return [...inMemoryData]
      return supabase.request<T[]>(`${tableName}?select=*`)
    },

    async findById(id: ID): Promise<T | null> {
      if (isMock) {
        return inMemoryData.find((item) => item.id === id) || null
      }
      const result = await supabase.request<T[]>(`${tableName}?id=eq.${id}&select=*`)
      return result.length > 0 ? result[0] : null
    },

    async create(data: CreateDTO): Promise<T> {
      if (isMock) {
        const newItem = {
          id: crypto.randomUUID(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as T
        inMemoryData.push(newItem)
        return newItem
      }
      const result = await supabase.request<T[]>(tableName, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return result[0]
    },

    async update(id: ID, data: UpdateDTO): Promise<T | null> {
      if (isMock) {
        const index = inMemoryData.findIndex((item) => item.id === id)
        if (index === -1) return null
        inMemoryData[index] = {
          ...inMemoryData[index],
          ...data,
          updated_at: new Date().toISOString(),
        }
        return inMemoryData[index]
      }
      const result = await supabase.request<T[]>(`${tableName}?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      return result.length > 0 ? result[0] : null
    },

    async delete(id: ID): Promise<boolean> {
      if (isMock) {
        const initialLength = inMemoryData.length
        inMemoryData = inMemoryData.filter((item) => item.id !== id)
        return inMemoryData.length !== initialLength
      }
      await supabase.request<void>(`${tableName}?id=eq.${id}`, {
        method: 'DELETE',
      })
      return true
    },
  }
}
