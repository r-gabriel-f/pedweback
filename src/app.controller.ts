import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Health liviano (no toca BD). Mantiene Render despierto.
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // Health con BD. Hace SELECT 1 para mantener Supabase activo.
  @Get('health/db')
  async healthDb() {
    await this.dataSource.query('SELECT 1');
    return {
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
