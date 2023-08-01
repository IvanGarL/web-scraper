import * as Chance from 'chance';
import { DateTime } from 'luxon';
import * as request from 'supertest';
import { EntityManager } from 'typeorm';
import App from '../../app';
import { Roles } from '../../entities/User';
import { UserFactory } from '../../factories/UserFactory';
import { ScraperRoute } from '../../routes/scraper.route';
import * as Encryption from '../../utils/encryption';

const app = new App([new ScraperRoute()]);
const chance = new Chance();
let manager: EntityManager;

beforeAll(async () => {
    await app.listen();
    await app.databaseConnection.resetConnections();
    manager = app.getDatabaseManager();
});

afterAll(async () => {
    // reset the database
    await app.databaseConnection.resetConnections();
    await app.databaseConnection.closeConnection();
});

describe('When sending a POST request to /scraper/website, then', () => {
    test('it should scrap a website and save the <a> tags', async () => {
        const user = await UserFactory.createUser(
            {
                email: 'ivangarl@yopmail.com',
                role: Roles.USER,
            },
            manager,
        );

        jest.spyOn(Encryption, 'decodeToken').mockReturnValue({
            _id: user.id,
            role: Roles.USER,
            email: 'ivangarl@yopmail.com',
            exp: DateTime.local().plus({ hours: 1 }).toJSDate(),
        });

        const websiteToScrap = 'https://www.larepublica.co/';
        const response = await request(app.getServer()).post('/scraper/website').send({
            website: websiteToScrap,
        });

        expect(response.error).toBeFalsy();
        expect(response.status).toBe(200);

        expect(response.body.message).toBe(`Saved scraped website: ${websiteToScrap}`);
    });
});
