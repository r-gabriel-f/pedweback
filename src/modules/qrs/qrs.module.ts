import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrsService } from './qrs.service';
import { QrsController } from './qrs.controller';
import { QR } from './qr.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QR, User])],
  controllers: [QrsController],
  providers: [QrsService],
  exports: [QrsService],
})
export class QrsModule {}
