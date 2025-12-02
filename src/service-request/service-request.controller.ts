import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

@Controller('service-request')
export class ServiceRequestController {
  constructor(private readonly serviceRequestService: ServiceRequestService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createServiceRequestDto: CreateServiceRequestDto, @Request() req) {
    return this.serviceRequestService.create(createServiceRequestDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.serviceRequestService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.serviceRequestService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: number, @Body() updateServiceRequestDto: UpdateServiceRequestDto, @Request() req) {
    return this.serviceRequestService.update(id, updateServiceRequestDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.serviceRequestService.remove(id);
  }
}
