import { Module } from '@nestjs/common'
import { ClientsController } from './clients.controller'
import { ClientsService } from './clients.service'
import { SupabaseService } from '../../supabase.service'

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, SupabaseService],
  exports: [ClientsService],
})
export class ClientsModule {}
