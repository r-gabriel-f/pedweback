import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../config/supabase.config';
import { GalleryService } from '../modules/gallery/gallery.service';
import { PetsService } from '../modules/pets/pets.service';
import * as sharp from 'sharp';

@Controller('uploads')
export class UploadController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly galleryService: GalleryService,
    private readonly petsService: PetsService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('user_id') userId?: string,
    @Body('pet_id') petId?: string,
    @Body('title') title?: string,
    @Body('description') description?: string,
  ) {
    if (!petId) {
      throw new BadRequestException('pet_id is required');
    }

    const pet_id = parseInt(petId, 10);
    if (isNaN(pet_id)) {
      throw new BadRequestException('pet_id must be a valid number');
    }

    // Validar que el pet existe y pertenece al usuario (si se envía user_id)
    if (userId) {
      const user_id = parseInt(userId, 10);
      if (isNaN(user_id)) {
        throw new BadRequestException('user_id must be a valid number');
      }

      try {
        const pet = await this.petsService.findOne(pet_id);
        if (pet.user_id !== user_id) {
          throw new UnauthorizedException(
            'The pet does not belong to the specified user',
          );
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new BadRequestException('Pet not found');
      }
    }

    const uploadResults = [];

    for (const file of files) {
      try {
        // 1. Convertir a WebP con Sharp
        const webpBuffer = await sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer();

        // 2. Nombre único para el archivo
        const fileName = `galeria/${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

        // 3. Subir a Supabase Storage
        const { error } = await this.supabase.client.storage
          .from('pets') // bucket
          .upload(fileName, webpBuffer, {
            contentType: 'image/webp',
          });

        if (error) {
          uploadResults.push({
            originalName: file.originalname,
            success: false,
            error: error.message,
          });
          continue;
        }

        // 4. Obtener URL pública
        const { data: publicUrlData } = this.supabase.client.storage
          .from('pets')
          .getPublicUrl(fileName);

        // 5. Guardar en la base de datos (solo con pet_id)
        try {
          const galleryItem = await this.galleryService.create(
            pet_id,
            publicUrlData.publicUrl,
            title,
            description,
          );

          uploadResults.push({
            originalName: file.originalname,
            success: true,
            url: publicUrlData.publicUrl,
            fileName: fileName,
            galleryId: galleryItem.id,
            pet_id: pet_id,
          });
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          uploadResults.push({
            originalName: file.originalname,
            success: false,
            error: `Database error: ${dbError.message}`,
          });
          continue;
        }
      } catch (error) {
        uploadResults.push({
          originalName: file.originalname,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      totalFiles: files.length,
      successfulUploads: uploadResults.filter((r) => r.success).length,
      failedUploads: uploadResults.filter((r) => !r.success).length,
      results: uploadResults,
    };
  }

  // Mantener el endpoint original para un solo archivo
  @Post('single')
  @UseInterceptors(FilesInterceptor('file', 1))
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    const file = files[0];

    // 1. Convertir a WebP con Sharp
    const webpBuffer = await sharp(file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // 2. Nombre único para el archivo
    const fileName = `galeria/${Date.now()}.webp`;

    // 3. Subir a Supabase Storage
    const { error } = await this.supabase.client.storage
      .from('pets') // bucket
      .upload(fileName, webpBuffer, {
        contentType: 'image/webp',
      });

    if (error) throw error;

    // 4. Obtener URL pública
    const { data: publicUrlData } = this.supabase.client.storage
      .from('pets')
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl };
  }
}
