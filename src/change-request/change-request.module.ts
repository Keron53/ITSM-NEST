import { Module } from '@nestjs/common';
import { ChangeRequestService } from './change-request.service';
import { ChangeRequestController } from './change-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeRequest } from './entities/change-request.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeRequest]), UsersModule],
  controllers: [ChangeRequestController],
  providers: [ChangeRequestService, UsersService],
  exports: [],
})
export class ChangeRequestModule { }
