import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common'
import { ServiceOrdersService } from './service-orders.service'

export class CreateServiceOrderDto {
  client_id: string
  unit_id: string
  technician_id?: string
  status?: string
  priority?: string
  service_type?: string
  description?: string
  scheduled_at?: string
}

export class UpdateStatusDto {
  status: string
}

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(@Body() createDto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(createDto)
  }

  @Get()
  findAll() {
    return this.serviceOrdersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id)
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateStatusDto) {
    return this.serviceOrdersService.updateStatus(id, updateDto.status)
  }
}
