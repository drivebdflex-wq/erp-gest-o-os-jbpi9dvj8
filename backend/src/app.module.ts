import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { SupabaseService } from './supabase.service'
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module'
import { ClientsModule } from './modules/clients/clients.module'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [ServiceOrdersModule, ClientsModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [
    SupabaseService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
