import { ServiceOrdersRepository } from '../repositories/service-orders.repository'
import { ContractUnitsRepository } from '../repositories/contract-units.repository'
import { ContractsRepository } from '../repositories/contracts.repository'
import { UsersRepository } from '../repositories/users.repository'
import { StorageService } from '../storage.service'
import { AuditsRepository } from '../repositories/auxiliary.repository'

export class SystemPurgeService {
  static async purgeAllData(currentUserId: string) {
    try {
      // 1. Service Orders
      const orders = await ServiceOrdersRepository.findAll()
      for (const o of orders) {
        await ServiceOrdersRepository.delete(o.id)
      }

      // 2. Contract Units
      const units = await ContractUnitsRepository.findAll()
      for (const u of units) {
        await ContractUnitsRepository.delete(u.id)
      }

      // 3. Contracts
      const contracts = await ContractsRepository.findAll()
      for (const c of contracts) {
        await ContractsRepository.delete(c.id)
      }

      // 4. Users (except current)
      const users = await UsersRepository.findAll()
      for (const u of users) {
        if (u.id !== currentUserId && u.id !== 'admin-id') {
          await UsersRepository.delete(u.id)
        }
      }

      // Storage Cleanup
      await StorageService.clearBucket('user-avatars')
      await StorageService.clearBucket('company-assets')

      // Audit Logs Cleanup & Final Entry
      try {
        const audits = await AuditsRepository.findAll()
        for (const a of audits) {
          await AuditsRepository.delete(a.id)
        }

        await AuditsRepository.create({
          table_name: 'system',
          record_id: 'purge',
          action: 'DELETE',
          old_value: null,
          new_value: { status: 'system_reset', purged_by: currentUserId },
        })
      } catch (e) {
        console.warn('Could not reset audits', e)
      }
    } catch (error) {
      console.error('Error during purge:', error)
      throw new Error('Falha ao limpar os dados do sistema. Verifique os logs.')
    }
  }
}
