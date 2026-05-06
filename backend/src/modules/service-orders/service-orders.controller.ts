import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common'
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
  order_number?: string
}

export class UpdateStatusDto {
  status: string
}

export class UpdateServiceOrderDto {
  status?: string
  priority?: string
  description?: string
  technician_id?: string
  scheduled_at?: string
  deadline_at?: string
  notes?: string
  client_id?: string
  diagnostics?: string
  cost_center?: string
  billing_status?: string
  approval_status?: string
  service_type?: string
  technician_signature_url?: string
  client_signature_url?: string
  ticket_number?: string
  dependency?: string
  agency_code?: string
  os_type?: string
  warranty?: boolean
  opening_date?: string
  acceptance_date?: string
  client_request?: string
  procedures_executed?: string
  pending_issues?: string
  risks_found?: string
  general_observations?: string
  technical_recommendations?: string
  operational_checklist?: string
  supervisor_id?: string
  vehicle_used?: string
  tools_used?: string
  displacement_time?: number
  discount?: number
  client_signature_name?: string
  client_signature_position?: string
  internal_code?: string
  billing_type?: string
  supervisor_approval?: boolean
  client_approval?: boolean
  is_billed?: boolean
  sector?: string
  reference_point?: string
  root_cause?: string
  supervisor_signature_url?: string
  km_driven?: number
}

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(@Body() createDto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(createDto)
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.serviceOrdersService.findAll(status)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id)
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateStatusDto) {
    return this.serviceOrdersService.updateStatus(id, updateDto.status)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateServiceOrderDto) {
    return this.serviceOrdersService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceOrdersService.remove(id)
  }
}
