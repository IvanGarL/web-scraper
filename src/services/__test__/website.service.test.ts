import { EntityManager } from 'typeorm';
import App from '../../app';
import { WebsiteRoute } from '../../routes/website.route';

const app = new App([new WebsiteRoute()]);
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
