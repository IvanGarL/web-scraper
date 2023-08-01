import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { isTestEnv } from '../utils/environment';
import * as entities from './entities';
import * as migrations from './migrations';

export const dbConfig: PostgresConnectionOptions = {
    type: 'postgres',
    port: 5432,
    synchronize: isTestEnv(),
    migrationsRun: !isTestEnv(),
    namingStrategy: new SnakeNamingStrategy(),
    logging: !isTestEnv(),
    host: '0.0.0.0',
    username: 'postgres',
    password: 'postgres',
    extra: { max: 3 }, // Limit the postgres connection pool size (1 master and 2 slaves per pool)
    database: isTestEnv() ? 'db_test' : 'db',
    entities: Object.values(entities),
    migrations: Object.values(migrations),
};

export default new DataSource({
    type: 'postgres',
    port: 5432,
    namingStrategy: new SnakeNamingStrategy(),
    host: '0.0.0.0',
    username: 'postgres',
    database: 'db',
    password: 'postgres',
    entities: ['dist/src/entities/*.js'],
    migrations: ['dist/src/migrations/*.js'],
});
