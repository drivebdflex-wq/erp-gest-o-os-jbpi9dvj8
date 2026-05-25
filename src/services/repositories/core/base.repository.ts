import { ID } from '../types/common'
import { supabase } from '@/lib/supabase/client'
import { BusinessError } from '@/services/business/errors'

export function createRepository<T extends { id: any }, CreateDTO, UpdateDTO>(
  tableName: string,
  mockData: T[] = [],
) {
  return {
    async findAll(): Promise<T[]> {
      const { data, error } = await supabase.from(tableName).select('*')
      if (error) throw new BusinessError(`Failed to fetch records for ${tableName}`)
      return data as T[]
    },
    async findById(id: ID): Promise<T | null> {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle()
      if (error) throw new BusinessError(`Failed to fetch record ${id} from ${tableName}`)
      return data as T | null
    },
    async create(data: CreateDTO): Promise<T> {
      const { data: created, error } = await supabase
        .from(tableName)
        .insert([data])
        .select()
        .single()
      if (error)
        throw new BusinessError(`Failed to create record in ${tableName}: ${error.message}`)
      return created as T
    },
    async update(id: ID, data: UpdateDTO): Promise<T | null> {
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single()
      if (error)
        throw new BusinessError(`Failed to update record ${id} in ${tableName}: ${error.message}`)
      return updated as T | null
    },
    async delete(id: ID): Promise<boolean> {
      const { error } = await supabase.from(tableName).delete().eq('id', id)
      if (error) throw new BusinessError(`Failed to delete record ${id} from ${tableName}`)
      return true
    },
  }
}
