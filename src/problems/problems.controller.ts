import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createProblemDto: CreateProblemDto, @Request() req) {
    return this.problemsService.create(createProblemDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.problemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.problemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: number, @Body() updateProblemDto: UpdateProblemDto, @Request() req) {
    return this.problemsService.update(id, updateProblemDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.problemsService.remove(id);
  }
}
