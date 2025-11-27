import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

@Controller('service-request')
export class ServiceRequestController {
  constructor(private readonly serviceRequestService: ServiceRequestService) {}

  @Post()
  create(@Body() createServiceRequestDto: CreateServiceRequestDto) {
    return this.serviceRequestService.create(createServiceRequestDto);
  }

  @Get()
  findAll() {
    return this.serviceRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.serviceRequestService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateServiceRequestDto: UpdateServiceRequestDto) {
    return this.serviceRequestService.update(id, updateServiceRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.serviceRequestService.remove(id);
  }
}
