import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Get()
  findAll() {
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.findOne(id);
  }

  @Get('qr/uuid/:qrUuid')
  findByQrUuid(@Param('qrUuid') qrUuid: string) {
    return this.petsService.findByQrUuid(qrUuid);
  }

  @Get('qr/:qrId')
  findByQrId(@Param('qrId', ParseIntPipe) qrId: number) {
    return this.petsService.findByQrId(qrId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.petsService.findByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePetDto: CreatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }

  @Put(':id')
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePetDto: CreatePetDto,
  ) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.remove(id);
  }
}
