import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { SupabaseService } from '../config/supabase.config';

@Module({
  controllers: [UploadController],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class UploadModule {}
