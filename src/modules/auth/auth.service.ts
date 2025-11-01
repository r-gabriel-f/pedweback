import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto): Promise<Omit<User, 'password'>> {
    // Buscar usuario por email
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    // Verificar contraseña con SHA256
    const hashedPassword = crypto
      .createHash('sha256')
      .update(loginDto.password)
      .digest('hex');

    if (hashedPassword !== user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Eliminar password de la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
