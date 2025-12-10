import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { ProblemsModule } from 'src/problems/problems.module';
import { ProblemsService } from 'src/problems/problems.service';

import { AppGateway } from '../gateways/app.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Incident]), UsersModule, ProblemsModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, UsersService, ProblemsService, AppGateway],
  exports: [],
})
export class IncidentsModule { }
