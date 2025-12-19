import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petsRepository.create({
      ...createPetDto,
      status: false, // Por defecto en false
    });
    return await this.petsRepository.save(pet);
  }

  async findAll(): Promise<Pet[]> {
    return await this.petsRepository.find({
      relations: ['qr', 'user'],
    });
  }

  async findOne(id: number): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { id },
      relations: ['qr', 'user'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    return pet;
  }

  async findByQrUuid(qrUuid: string): Promise<Pet> {
    const pet = await this.petsRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.qr', 'qr')
      .leftJoinAndSelect('pet.user', 'user')
      .leftJoinAndSelect('pet.gallery', 'gallery', 'gallery.pet_id = pet.id')
      .where('qr.uuid = :qrUuid', { qrUuid })
      .addOrderBy('gallery.create_at', 'DESC')
      .getOne();

    if (!pet) {
      throw new NotFoundException(`No pet found for QR with UUID ${qrUuid}`);
    }

    return pet;
  }

  async findByQrId(qrId: number): Promise<Pet[]> {
    return await this.petsRepository.find({
      where: { qr_id: qrId },
      relations: ['qr', 'user'],
    });
  }

  async findByUserId(userId: number): Promise<Pet[]> {
    return await this.petsRepository.find({
      where: { user_id: userId },
      relations: ['qr', 'user'],
    });
  }

  async update(id: number, updatePetDto: CreatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);

    Object.assign(pet, updatePetDto);

    return await this.petsRepository.save(pet);
  }

  async remove(id: number): Promise<void> {
    const pet = await this.findOne(id);
    await this.petsRepository.remove(pet);
  }
}
