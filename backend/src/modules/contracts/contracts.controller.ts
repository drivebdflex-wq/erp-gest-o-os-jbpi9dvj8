import { Controller, Delete, Param, Get, Query } from '@nestjs/common'
import { ContractsService } from './contracts.service'

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.contractsService.findAll(status)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id)
  }
}
