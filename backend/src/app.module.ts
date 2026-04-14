import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { SupabaseService } from './supabase.service'
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module'

@Module({
  imports: [ServiceOrdersModule],
  controllers: [AppController],
  providers: [SupabaseService],
})
export class AppModule {}
