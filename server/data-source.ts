import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    join(
      __dirname,
      'src/infrastructure/persistence/typeorm/entities/**/*.schema{.ts,.js}',
    ),
  ],
  migrations: [
    join(
      __dirname,
      'src/infrastructure/persistence/typeorm/migrations/**/*{.ts,.js}',
    ),
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  migrationsTableName: 'typeorm_migrations',
  metadataTableName: 'typeorm_metadata',
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
