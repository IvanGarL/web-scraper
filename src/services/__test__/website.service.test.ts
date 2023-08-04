import * as _ from 'lodash';
import { DateTime } from 'luxon';
import * as request from 'supertest';
import { EntityManager } from 'typeorm';
import App from '../../app';
import { Roles } from '../../entities/User';
import { LinkFactory } from '../../factories/LinkFactory';
import { UserFactory } from '../../factories/UserFactory';
import { WebsiteFactory } from '../../factories/WebsiteFactory';
import { WebsiteRoute } from '../../routes/website.route';
import * as Encryption from '../../utils/encryption';

const app = new App([new WebsiteRoute()]);
let manager: EntityManager;

beforeAll(async () => {
    await app.listen();
    // reset the database
    await app.databaseConnection.resetConnections();
    manager = app.getDatabaseManager();
});

beforeEach(async () => {
    await app.databaseConnection.resetConnections();
});

afterAll(async () => {
    // reset the database
    await app.databaseConnection.resetConnections();
    await app.databaseConnection.closeConnection();
});

describe('When sending a GET request to /website, then', () => {
    test('it should return the websites scraped by the user', async () => {
        const user = await UserFactory.createUser(
            {
                email: 'ivangarl@yopmail.com',
                role: Roles.USER,
            },
            manager,
        );

        const scrapedWebsite = await WebsiteFactory.createWebsite(
            {
                url: 'https://www.larepublica.co/',
                timesConsulted: 1,
                lastConsultedAt: DateTime.local().minus({ hours: 25 }).toJSDate(),
                user,
            },
            manager,
        );

        const links = await Promise.all(
            _.range(3).map((i) =>
                LinkFactory.createLink(
                    { websiteId: scrapedWebsite.id, url: `https://www.larepublica.co/link${i + 5}` },
                    manager,
                ),
            ),
        );

        jest.spyOn(Encryption, 'decodeToken').mockReturnValue({
            _id: user.id,
            role: Roles.USER,
            email: 'ivangarl@yopmail.com',
            exp: DateTime.local().plus({ hours: 1 }).toJSDate(),
        });

        const response = await request(app.getServer()).get('/website').query({
            page: 1,
        });

        expect(response.error).toBeFalsy();
        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('websites');
        expect(response.body.websites).toHaveLength(1);
        expect(response.body.websites[0]).toHaveProperty('url', scrapedWebsite.url);
    });

    describe('When sending a GET request to /website/links, then', () => {
        test('it should return the links scraped from a website', async () => {
            const user = await UserFactory.createUser(
                {
                    email: 'ivangarl@yopmail.com',
                    role: Roles.USER,
                },
                manager,
            );

            const scrapedWebsite = await WebsiteFactory.createWebsite(
                {
                    url: 'https://www.larepublica.co/',
                    timesConsulted: 1,
                    lastConsultedAt: DateTime.local().minus({ hours: 25 }).toJSDate(),
                    user,
                },
                manager,
            );

            const links = await Promise.all(
                _.range(200).map((i) =>
                    LinkFactory.createLink(
                        { websiteId: scrapedWebsite.id, url: `https://www.larepublica.co/link${i + 5}` },
                        manager,
                    ),
                ),
            );

            jest.spyOn(Encryption, 'decodeToken').mockReturnValue({
                _id: user.id,
                role: Roles.USER,
                email: 'ivangarl@yopmail.com',
                exp: DateTime.local().plus({ hours: 1 }).toJSDate(),
            });

            const response = await request(app.getServer())
                .get('/website/links')
                .send({
                    website: scrapedWebsite.url,
                })
                .query({
                    page: 1,
                });

            expect(response.error).toBeFalsy();
            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty('links');
            expect(response.body.links).toHaveLength(100);
            expect(response.body.pagesCount).toBe(2);
        });
    });
});
