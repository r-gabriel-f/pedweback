import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
