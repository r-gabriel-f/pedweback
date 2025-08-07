import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateQrDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
