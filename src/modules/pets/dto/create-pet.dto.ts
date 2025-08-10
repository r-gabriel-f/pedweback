import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreatePetDto {
  @IsOptional()
  @IsNumber()
  qr_id?: number;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  specie?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  age?: number;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  characteristics?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  health_status?: string;

  @IsOptional()
  @IsString()
  health_vaccinations?: string;

  @IsOptional()
  @IsDateString()
  health_lastVetVisit?: string;

  @IsOptional()
  @IsString()
  enviroment_type?: string;

  @IsOptional()
  @IsString()
  enviroment_setting?: string;

  @IsOptional()
  @IsString()
  enviroment_otherPets?: string;

  @IsOptional()
  @IsBoolean()
  enviroment_hasYard?: boolean;
}
