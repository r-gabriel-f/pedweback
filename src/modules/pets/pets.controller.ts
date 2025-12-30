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

  @Get('uuid/:qrUuid')
  findByUuid(@Param('qrUuid') qrUuid: string) {
    return this.petsService.findByQrUuid(qrUuid);
  }

  @Get('qr/uuid/:qrUuid')
  findByQrUuid(@Param('qrUuid') qrUuid: string) {
    return this.petsService.findByQrUuid(qrUuid);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.findOne(id);
  }

  @Get('qr/:qrId')
  findByQrId(@Param('qrId', ParseIntPipe) qrId: number) {
    return this.petsService.findByQrId(qrId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.petsService.findByUserId(userId);
  }

  @Patch('qr/uuid/:qrUuid')
  updateByQrUuid(
    @Param('qrUuid') qrUuid: string,
    @Body() updatePetDto: CreatePetDto,
  ) {
    return this.petsService.updateByQrUuid(qrUuid, updatePetDto);
  }

  @Put('qr/uuid/:qrUuid')
  updatePutByQrUuid(
    @Param('qrUuid') qrUuid: string,
    @Body() updatePetDto: CreatePetDto,
  ) {
    return this.petsService.updateByQrUuid(qrUuid, updatePetDto);
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
