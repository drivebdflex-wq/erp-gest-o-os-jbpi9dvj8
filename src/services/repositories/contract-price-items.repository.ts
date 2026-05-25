import { createRepository } from './core/base.repository'
import { isMock, supabase } from '@/lib/supabase'

export interface ContractPriceItem {
  id: string
  contract_id: string
  service_code: string
  service_name: string
  unit_price: number
  created_at?: string
  updated_at?: string
}

const mockData: ContractPriceItem[] = [
  {
    id: 'p1',
    contract_id: '77777777-7777-7777-7777-777777777777',
    service_code: '001',
    service_name: 'Troca de lâmpada',
    unit_price: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    contract_id: '77777777-7777-7777-7777-777777777777',
    service_code: '002',
    service_name: 'Manutenção elétrica',
    unit_price: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const baseRepo = createRepository<ContractPriceItem, any, any>('contract_price_items', mockData)

export const ContractPriceItemsRepository = {
  ...baseRepo,
  async overwriteForContract(contractId: string, items: any[]) {
    if (isMock) {
      const all = await this.findAll()
      const toDelete = all.filter((i) => i.contract_id === contractId)
      for (const item of toDelete) {
        await this.delete(item.id)
      }
      for (const item of items) {
        await this.create(item)
      }
    } else {
      await supabase.request(`contract_price_items?contract_id=eq.${contractId}`, {
        method: 'DELETE',
      })
      if (items.length > 0) {
        await supabase.request('contract_price_items', {
          method: 'POST',
          body: JSON.stringify(items),
        })
      }
    }
  },
}
