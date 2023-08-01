import { asyncify, mapLimit } from 'async';
import { DataSource, EntityManager, EntityMetadata } from 'typeorm';
import { dbConfig } from './db.config';

/**
 * Singleton class to manage the database connection
 */
export class DatabaseConnection {
    private static instance: DatabaseConnection;

    private dataSource: DataSource;

    private connectionManager: EntityManager;

    private constructor() {
        if (!this.dataSource) this.dataSource = new DataSource(dbConfig);
    }

    static async getInstance(): Promise<DatabaseConnection> {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
            DatabaseConnection.instance.dataSource = await this.instance.dataSource.initialize();
            DatabaseConnection.instance.connectionManager = DatabaseConnection.instance.dataSource.manager;
        }

        return DatabaseConnection.instance;
    }

    public getConnectionManager(): EntityManager {
        if (this.dataSource) return this.connectionManager;

        return null;
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

    /**
     * Closes the current connection
     */
    public async closeConnection(): Promise<void> {
        try {
            if (this.dataSource) await this.dataSource.destroy();
        } catch (e) {
            console.error('Error closing connection', e);
        }
    }

    /**
     * Reset the database connections
     */
    public async resetConnections(): Promise<void> {
        const entities = this.dataSource.entityMetadatas;
        await Promise.all([
            // Delete each entity's table rows
            await mapLimit(
                entities,
                5,
                asyncify(async (entity: EntityMetadata) => {
                    try {
                        // Reset tables information
                        const repository = this.dataSource.getRepository(entity.name);
                        await repository.query(
                            `ALTER TABLE ${entity.schema || 'public'}.${
                                entity.tableNameWithoutPrefix
                            } DISABLE TRIGGER ALL;`,
                        );

                        await repository.query(
                            `DELETE FROM ${entity.schema || 'public'}.${entity.tableNameWithoutPrefix};`,
                        );

                        await repository.query(
                            `ALTER TABLE ${entity.schema || 'public'}.${
                                entity.tableNameWithoutPrefix
                            } ENABLE TRIGGER ALL;`,
                        );

                        // Reset tables sequences
                        const sequences = await this.dataSource.manager.query(
                            'SELECT * FROM information_schema.sequences',
                        );
                        const restartSequences: Promise<any>[] = [];
                        sequences.forEach(seq => {
                            if (seq.sequence_name !== 'migrations_id_seq') {
                                restartSequences.push(
                                    this.dataSource.manager.query(`ALTER SEQUENCE ${seq.sequence_name} RESTART;`),
                                );
                            }
                        });
                        await Promise.all(restartSequences);
                    } catch (e) {
                        console.error(`Error while clearing the table ${entity.tableNameWithoutPrefix}`, e);
                        throw e;
                    }
                }),
            ),
        ]);
    }
}
