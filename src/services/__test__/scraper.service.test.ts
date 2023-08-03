import * as _ from 'lodash';
import { DateTime } from 'luxon';
import * as request from 'supertest';
import { EntityManager } from 'typeorm';
import App from '../../app';
import { Roles } from '../../entities/User';
import { Website } from '../../entities/Website';
import { LinkFactory } from '../../factories/LinkFactory';
import { UserFactory } from '../../factories/UserFactory';
import { WebsiteFactory } from '../../factories/WebsiteFactory';
import { ScraperRoute } from '../../routes/scraper.route';
import * as Encryption from '../../utils/encryption';
import { WebsiteScraper } from '../../utils/scraper';

const app = new App([new ScraperRoute()]);
let manager: EntityManager;

beforeAll(async () => {
    await app.listen();
    await app.databaseConnection.resetConnections();
    manager = app.getDatabaseManager();
});

afterAll(async () => {
    await app.databaseConnection.resetConnections();
    await app.databaseConnection.closeConnection();
});

describe('When sending a POST request to /scraper/website, then', () => {
    beforeEach(async () => {
        await app.databaseConnection.resetConnections();
        jest.clearAllMocks();
    });

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
        jest.spyOn(WebsiteScraper.prototype, 'scrapeWebsite').mockImplementation(() => null);
        jest.spyOn(WebsiteScraper.prototype, 'getLinks').mockReturnValue(
            new Map<string, string>([
                ['link1', 'https://www.larepublica.co/link1'],
                ['link2', 'https://www.larepublica.co/link2'],
                ['link3', 'https://www.larepublica.co/link3'],
            ]).entries(),
        );

        const websiteToScrap = 'https://www.larepublica.co/';
        const response = await request(app.getServer()).post('/scraper/website').send({
            website: websiteToScrap,
        });

        expect(response.error).toBeFalsy();
        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`Saved scraped website: ${websiteToScrap}`);

        const websiteScraped = await manager.findOne(Website, {
            where: { url: websiteToScrap, userId: user.id },
            relations: ['links'],
        });

        expect(websiteScraped).toBeTruthy();
        expect(websiteScraped.links).toHaveLength(3);
        expect(websiteScraped.links[0].url).toBe('https://www.larepublica.co/link1');
        expect(websiteScraped.links[1].url).toBe('https://www.larepublica.co/link2');
        expect(websiteScraped.links[2].url).toBe('https://www.larepublica.co/link3');
    });
    test('if website has already have been scraped, then dont update links and add in a new consult to the count', async () => {
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

        scrapedWebsite.links = links;
        await manager.save(Website, scrapedWebsite);

        jest.spyOn(Encryption, 'decodeToken').mockReturnValue({
            _id: user.id,
            role: Roles.USER,
            email: 'ivangarl@yopmail.com',
            exp: DateTime.local().plus({ hours: 1 }).toJSDate(),
        });
        jest.spyOn(WebsiteScraper.prototype, 'scrapeWebsite').mockImplementation(() => null);
        jest.spyOn(WebsiteScraper.prototype, 'getLinks').mockReturnValue(
            new Map<string, string>([
                ['link1', 'https://www.larepublica.co/link1'],
                ['link2', 'https://www.larepublica.co/link2'],
                ['link3', 'https://www.larepublica.co/link3'],
            ]).entries(),
        );

        const websiteToScrap = scrapedWebsite.url;
        const response = await request(app.getServer()).post('/scraper/website').send({
            website: websiteToScrap,
        });

        expect(response.error).toBeFalsy();
        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`Saved scraped website: ${websiteToScrap}`);

        const websiteScraped = await manager.findOne(Website, {
            where: { url: websiteToScrap, userId: user.id },
            relations: ['links'],
        });

        expect(websiteScraped).toBeTruthy();
        expect(websiteScraped.links).toHaveLength(3);
        expect(websiteScraped.links[0].url).toBe('https://www.larepublica.co/link1');
        expect(websiteScraped.links[1].url).toBe('https://www.larepublica.co/link2');
        expect(websiteScraped.links[2].url).toBe('https://www.larepublica.co/link3');
        expect(websiteScraped.timesConsulted).toBe(2);
    });
    test('if website has already have been scraped in the last 24 hours, then dont update links and add in a new consult to the count', async () => {
        const user = await UserFactory.createUser(
            {
                email: '',
                role: Roles.USER,
            },
            manager,
        );

        const scrapedWebsite = await WebsiteFactory.createWebsite(
            {
                url: 'https://www.larepublica.co/',
                timesConsulted: 1,
                lastConsultedAt: DateTime.local().minus({ hours: 23 }).toJSDate(),
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

        scrapedWebsite.links = links;
        await manager.save(Website, scrapedWebsite);

        jest.spyOn(Encryption, 'decodeToken').mockReturnValue({
            _id: user.id,
            role: Roles.USER,
            email: 'ivangarl@yopmail.com',
            exp: DateTime.local().plus({ hours: 1 }).toJSDate(),
        });

        const websiteToScrap = scrapedWebsite.url;
        const response = await request(app.getServer()).post('/scraper/website').send({
            website: websiteToScrap,
        });

        expect(response.error).toBeTruthy();
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Website already scraped');

        const websiteScraped = await manager.findOne(Website, {
            where: { url: websiteToScrap, userId: user.id },
            relations: ['links'],
        });

        expect(websiteScraped).toBeTruthy();
        expect(websiteScraped.links).toHaveLength(3);
        expect(websiteScraped.links[0].url).toBe('https://www.larepublica.co/link5');
        expect(websiteScraped.links[1].url).toBe('https://www.larepublica.co/link6');
        expect(websiteScraped.links[2].url).toBe('https://www.larepublica.co/link7');
        expect(websiteScraped.timesConsulted).toBe(2);
    });
});
