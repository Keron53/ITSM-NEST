import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from './entities/problem.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

import { AppGateway } from '../gateways/app.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Problem]), UsersModule],
  controllers: [ProblemsController],
  providers: [ProblemsService, UsersService, AppGateway],
  exports: [TypeOrmModule],
})
export class ProblemsModule { }
