import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Gallery } from './gallery.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
  ) {}

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
}
