import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isProduction = process.env.NODE_ENV === 'production';

// synchronize altera el schema automáticamente — peligrosísimo en prod.
// Requiere opt-in explícito vía DB_SYNCHRONIZE=true (y nunca en producción).
const syncEnabled =
  !isProduction && process.env.DB_SYNCHRONIZE === 'true';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: syncEnabled,
  logging: !isProduction,
};
