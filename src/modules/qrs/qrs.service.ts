import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QR } from './qr.entity';
import { User } from '../users/user.entity';
import { CreateQrDto } from './dto/create-qr.dto';

@Injectable()
export class QrsService {
  constructor(
    @InjectRepository(QR)
    private qrsRepository: Repository<QR>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createQrDto: CreateQrDto): Promise<QR> {
    const user = await this.usersRepository.findOne({
      where: { id: createQrDto.user_id },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createQrDto.user_id} not found`,
      );
    }

    const qr = this.qrsRepository.create(createQrDto);
    return await this.qrsRepository.save(qr);
  }

  async findAll(): Promise<QR[]> {
    return await this.qrsRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<QR> {
    const qr = await this.qrsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!qr) {
      throw new NotFoundException(`QR with ID ${id} not found`);
    }
    return qr;
  }

  async findByUuid(uuid: string): Promise<QR> {
    const qr = await this.qrsRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });
    if (!qr) {
      throw new NotFoundException(`QR with UUID ${uuid} not found`);
    }
    return qr;
  }

  async findByUserId(userId: number): Promise<QR[]> {
    return await this.qrsRepository.find({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  async remove(id: number): Promise<void> {
    const qr = await this.findOne(id);
    await this.qrsRepository.remove(qr);
  }
}
