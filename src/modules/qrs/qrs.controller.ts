import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { QrsService } from './qrs.service';
import { CreateQrDto } from './dto/create-qr.dto';

@Controller('qrs')
export class QrsController {
  constructor(private readonly qrsService: QrsService) {}

  @Post()
  create(@Body() createQrDto: CreateQrDto) {
    return this.qrsService.create(createQrDto);
  }

  @Get()
  findAll() {
    return this.qrsService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.qrsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.qrsService.findOne(id);
  }

  @Get('uuid/:uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.qrsService.findByUuid(uuid);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.qrsService.remove(id);
  }
}
