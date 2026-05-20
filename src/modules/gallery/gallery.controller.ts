import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const galleryItem = await this.galleryService.findOne(id);

    await this.galleryService.removeFromStorage(galleryItem.image_url);
    await this.galleryService.remove(id);

    return {
      message: 'Image deleted successfully',
      deletedId: id,
    };
  }
}
