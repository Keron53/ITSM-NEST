import { Module } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestController } from './service-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './entities/service-request.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

import { AppGateway } from '../gateways/app.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest]), UsersModule],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService, UsersService, AppGateway],
  exports: [],
})
export class ServiceRequestModule { }
