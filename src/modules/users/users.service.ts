import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validar email único
    if (createUserDto.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Validar teléfono único
    if (createUserDto.phone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { phone: createUserDto.phone },
      });
      if (existingUserByPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    if (createUserDto.password) {
      const saltRounds = 10;
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: CreateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Validar email único (excluyendo el usuario actual)
    if (updateUserDto.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    // Validar teléfono único (excluyendo el usuario actual)
    if (updateUserDto.phone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existingUserByPhone && existingUserByPhone.id !== id) {
        throw new ConflictException('Phone number already exists');
      }
    }

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
