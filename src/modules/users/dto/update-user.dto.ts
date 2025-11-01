import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  surnames?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  geographic?: string;

  @IsOptional()
  @IsNumber()
  phone?: number;

  @IsOptional()
  @IsNumber()
  second_phone?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
