import { EntityManager } from 'typeorm';
import App from '../../app';
import { UsersRoute } from '../../routes/users.route';

const app = new App([new UsersRoute()]);
let manager: EntityManager;

beforeAll(async () => {
    await app.listen();
    // reset the database
    await app.databaseConnection.resetConnections();
    manager = app.getDatabaseManager();
});

afterAll(async () => {
    // reset the database
    await app.databaseConnection.resetConnections();
    await app.databaseConnection.closeConnection();
});

describe('When sending a POST request to /scraper/website, then', () => {
    // TODO: Implement this test
});
