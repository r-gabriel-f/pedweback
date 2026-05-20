import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Gallery } from './gallery.entity';
import { SupabaseService } from '../../config/supabase.config';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
    private readonly supabase: SupabaseService,
  ) {}

  extractFileNameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname
        .split('/')
        .filter((part) => part !== '');
      const petsIndex = pathParts.findIndex((part) => part === 'pets');
      if (petsIndex !== -1 && petsIndex < pathParts.length - 1) {
        return pathParts.slice(petsIndex + 1).join('/');
      }
      const match = url.match(/pets\/(.+?)(?:\?|$)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch {
      return null;
    }
  }

  async removeFromStorage(imageUrl: string): Promise<void> {
    const fileName = this.extractFileNameFromUrl(imageUrl);
    if (!fileName) return;

    const fileBaseName = fileName.split('/').pop();
    const { data: listData } = await this.supabase.adminClient.storage
      .from('pets')
      .list('galeria', { search: fileBaseName });

    let filePathToDelete = fileName;
    if (listData && listData.length > 0) {
      filePathToDelete = `galeria/${listData[0].name}`;
    }

    await this.supabase.adminClient.storage
      .from('pets')
      .remove([filePathToDelete]);
  }

  async create(
    petId: number,
    imageUrl: string,
    title?: string,
    description?: string,
  ): Promise<Gallery> {
    const galleryItem = this.galleryRepository.create({
      pet_id: petId,
      image_url: imageUrl,
      title: title || null,
      description: description || null,
    });

    const savedItem = await this.galleryRepository.save(galleryItem);
    return savedItem;
  }

  async findByPetId(petId: number): Promise<Gallery[]> {
    return await this.galleryRepository.find({
      where: { pet_id: petId },
      order: { create_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Gallery> {
    const galleryItem = await this.galleryRepository.findOne({
      where: { id },
    });

    if (!galleryItem) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }

    return galleryItem;
  }

  async remove(id: number): Promise<Gallery> {
    const galleryItem = await this.findOne(id);
    await this.galleryRepository.remove(galleryItem);
    return galleryItem;
  }

  async removeMultiple(ids: number[]): Promise<Gallery[]> {
    const galleryItems = await this.galleryRepository.find({
      where: { id: In(ids) },
    });

    if (galleryItems.length === 0) {
      throw new NotFoundException(
        'No gallery images found with the provided IDs',
      );
    }

    await this.galleryRepository.remove(galleryItems);
    return galleryItems;
  }

  async removeByPetId(petId: number): Promise<Gallery[]> {
    const galleryItems = await this.findByPetId(petId);

    if (galleryItems.length === 0) {
      return [];
    }

    await this.galleryRepository.remove(galleryItems);
    return galleryItems;
  }

  async replaceProfileImages(
    petId: number,
    keepId: number,
  ): Promise<Gallery[]> {
    const oldProfiles = await this.galleryRepository.find({
      where: { pet_id: petId, title: 'perfil', id: Not(keepId) },
    });

    if (oldProfiles.length === 0) return [];

    await Promise.all(
      oldProfiles.map((item) =>
        this.removeFromStorage(item.image_url).catch((err) =>
          console.error(
            `Failed to remove old profile from storage (id=${item.id}):`,
            err,
          ),
        ),
      ),
    );

    await this.galleryRepository.remove(oldProfiles);
    return oldProfiles;
  }
}
