import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const rootDir = process.env.NODE_ENV === 'development' ? './src' : './dist/src';

const config: DataSourceOptions = {
    type: 'postgres',
    port: 5432,
    namingStrategy: new SnakeNamingStrategy(),
    host: '0.0.0.0',
    username: 'postgres',
    password: 'postgres',
    database: 'db',
    synchronize: true,
    logging: false,
    entities: [rootDir + '/entities/**/*.{js,ts}'],
};

export default config;
