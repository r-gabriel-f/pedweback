import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { SupabaseService } from '../config/supabase.config';
import { GalleryModule } from '../modules/gallery/gallery.module';
import { PetsModule } from '../modules/pets/pets.module';

@Module({
  imports: [GalleryModule, PetsModule],
  controllers: [UploadController],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class UploadModule {}
