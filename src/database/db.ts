import { Connection, createConnection, EntityManager, getConnectionManager } from 'typeorm';
import config from '../../ormconfig';

/**
 * Creates a connection with the database and return the EntityManager
 * associated with this db
 * @returns
 */
export const getConnection = async (): Promise<EntityManager> => {
    const connectionManager = getConnectionManager();
    let connection: Connection;

    if (connectionManager.has(config.name)) {
        connection = connectionManager.get(config.name);
    } else {
        connection = await createConnection(config);
    }
    if (!connection.isConnected) await connection.connect();

    return connection.manager;
};
