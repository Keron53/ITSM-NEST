import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ProblemsModule } from './problems/problems.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ChangeRequestModule } from './change-request/change-request.module';
import { AuthModule } from './auth/auth.module';

import { AppGateway } from './gateways/app.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'user_crud',
      password: 'root',
      database: 'db_crud',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    IncidentsModule,
    ProblemsModule,
    ServiceRequestModule,
    ChangeRequestModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule { }
