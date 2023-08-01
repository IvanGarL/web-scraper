import { DataSource, EntityManager } from 'typeorm';
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
}
