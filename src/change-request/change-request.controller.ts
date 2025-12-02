import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChangeRequestService } from './change-request.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';

@Controller('change-request')
export class ChangeRequestController {
  constructor(private readonly changeRequestService: ChangeRequestService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createChangeRequestDto: CreateChangeRequestDto, @Request() req) {
    return this.changeRequestService.create(createChangeRequestDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.changeRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.changeRequestService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: number, @Body() updateChangeRequestDto: UpdateChangeRequestDto, @Request() req) {
    return this.changeRequestService.update(id, updateChangeRequestDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.changeRequestService.remove(id);
  }
}
