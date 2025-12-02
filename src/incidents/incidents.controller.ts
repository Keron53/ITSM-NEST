import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createIncidentDto: CreateIncidentDto, @Request() req) {
    return this.incidentsService.create(createIncidentDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.incidentsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: number, @Body() updateIncidentDto: UpdateIncidentDto, @Request() req) {
    return this.incidentsService.update(id, updateIncidentDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.incidentsService.remove(id);
  }
}
