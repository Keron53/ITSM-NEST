import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChangeRequestService } from './change-request.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';

@Controller('change-request')
export class ChangeRequestController {
  constructor(private readonly changeRequestService: ChangeRequestService) {}

  @Post()
  create(@Body() createChangeRequestDto: CreateChangeRequestDto) {
    return this.changeRequestService.create(createChangeRequestDto);
  }

  @Get()
  findAll() {
    return this.changeRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.changeRequestService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateChangeRequestDto: UpdateChangeRequestDto) {
    return this.changeRequestService.update(id, updateChangeRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.changeRequestService.remove(id);
  }
}
