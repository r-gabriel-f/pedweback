import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../config/supabase.config';
import * as sharp from 'sharp';

@Controller('uploads')
export class UploadController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
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

        uploadResults.push({
          originalName: file.originalname,
          success: true,
          url: publicUrlData.publicUrl,
          fileName: fileName,
        });
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
