import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedsModule } from './breeds/breeds.module';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ProblemsModule } from './problems/problems.module';
import { ServiceRequestModule } from './service-request/service-request.module';
import { ChangeRequestModule } from './change-request/change-request.module';

@Module({
  imports: [
    CatsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'user_crud',
      password: 'root',
      database: 'db_crud',
      autoLoadEntities: true,
      synchronize: true,
    }),
    BreedsModule,
    UsersModule,
    IncidentsModule,
    ProblemsModule,
    ServiceRequestModule,
    ChangeRequestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
