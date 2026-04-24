import { UsersController } from '@/controllers/users.controller'
import { UsersService } from '@/services/business/users.service'

/**
 * Users Module
 * Organizes user management functionalities into a logical module structure,
 * connecting the external API service layer with the controller layer.
 */
export const UsersModule = {
  controller: UsersController,
  service: UsersService,
}
