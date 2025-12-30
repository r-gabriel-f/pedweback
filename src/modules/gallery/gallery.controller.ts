import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { SupabaseService } from '../../config/supabase.config';

@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly supabase: SupabaseService,
  ) {}

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const galleryItem = await this.galleryService.findOne(id);

    // Extraer el nombre del archivo de la URL
    const fileName = this.extractFileNameFromUrl(galleryItem.image_url);

    // Eliminar el archivo de Supabase Storage
    if (fileName) {
      const fileBaseName = fileName.split('/').pop();

      // Verificar que el archivo existe y obtener el path correcto
      const { data: listData } = await this.supabase.adminClient.storage
        .from('pets')
        .list('galeria', {
          search: fileBaseName,
        });

      // Construir el path correcto usando el nombre exacto del archivo encontrado
      let filePathToDelete = fileName;
      if (listData && listData.length > 0) {
        filePathToDelete = `galeria/${listData[0].name}`;
      }

      // Eliminar el archivo usando el cliente administrativo
      await this.supabase.adminClient.storage
        .from('pets')
        .remove([filePathToDelete]);
    }

    // Eliminar el registro de la base de datos
    await this.galleryService.remove(id);

    return {
      message: 'Image deleted successfully',
      deletedId: id,
    };
  }

  private extractFileNameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname
        .split('/')
        .filter((part) => part !== '');

      // Buscar el índice del bucket "pets" en el path
      const petsIndex = pathParts.findIndex((part) => part === 'pets');

      if (petsIndex !== -1 && petsIndex < pathParts.length - 1) {
        return pathParts.slice(petsIndex + 1).join('/');
      }

      // Fallback: regex para encontrar pets/[path]
      const match = url.match(/pets\/(.+?)(?:\?|$)/);
      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch {
      return null;
    }
  }
}
