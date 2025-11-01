import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pet } from '../pets/pet.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
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
      createUserDto.password = crypto
        .createHash('sha256')
        .update(createUserDto.password)
        .digest('hex');
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<
    (User & {
      pets_count: {
        active: number;
        pending: number;
        total: number;
      };
    })[]
  > {
    const users = await this.usersRepository.find();

    // Obtener conteo de mascotas por usuario
    const usersWithPetsCount = await Promise.all(
      users.map(async (user) => {
        const activeCount = await this.petsRepository.count({
          where: { user_id: user.id, status: true },
        });

        const pendingCount = await this.petsRepository.count({
          where: { user_id: user.id, status: false },
        });

        return {
          ...user,
          pets_count: {
            active: activeCount,
            pending: pendingCount,
            total: activeCount + pendingCount,
          },
        };
      }),
    );

    return usersWithPetsCount;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
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

    // Separar password y oldPassword del resto de los datos
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      oldPassword,
      password: passwordFromDto,
      ...updateData
    } = updateUserDto;

    // Verificar si realmente queremos actualizar el password (no vacío)
    const shouldUpdatePassword =
      passwordFromDto &&
      typeof passwordFromDto === 'string' &&
      passwordFromDto.trim() !== '';

    // Caso 1: Si se pasa password nuevo (no vacío), validar oldPassword y actualizar
    if (shouldUpdatePassword) {
      if (!oldPassword) {
        throw new UnauthorizedException(
          'Old password is required to update password',
        );
      }

      // Verificar que el password antiguo sea correcto
      const hashedOldPassword = crypto
        .createHash('sha256')
        .update(oldPassword)
        .digest('hex');

      if (hashedOldPassword !== user.password) {
        throw new UnauthorizedException('Old password is incorrect');
      }

      // Hash del nuevo password con SHA256 y agregarlo a updateData
      (updateData as any).password = crypto
        .createHash('sha256')
        .update(passwordFromDto)
        .digest('hex');
    }
    // Caso 2: Si no se pasa password o viene vacío, no incluirlo en updateData
    // Así se mantiene el password actual del usuario

    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
