import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { QrsModule } from './modules/qrs/qrs.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), UsersModule, QrsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
