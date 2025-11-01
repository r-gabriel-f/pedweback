import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
      const saltRounds = 10;
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
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

    // Si se intenta actualizar el password, validar el password antiguo
    if (updateUserDto.password) {
      if (!updateUserDto.oldPassword) {
        throw new UnauthorizedException(
          'Old password is required to update password',
        );
      }

      // Verificar que el password antiguo sea correcto
      const isOldPasswordValid = await bcrypt.compare(
        updateUserDto.oldPassword,
        user.password,
      );

      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Old password is incorrect');
      }

      // Encriptar el nuevo password
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    // Eliminar oldPassword del objeto antes de actualizar (no es un campo de la entidad)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { oldPassword, ...updateData } = updateUserDto;

    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
