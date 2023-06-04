import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const rootDir = process.env.NODE_ENV === 'development' ? './src' : './dist/src';

const config: ConnectionOptions = {
    type: 'postgres',
    namingStrategy: new SnakeNamingStrategy(),
    name: 'default',
    host: 'db',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'db',
    synchronize: true,
    logging: false,
    entities: [rootDir + '/entities/**/*.{js,ts}'],
};

export default config;
