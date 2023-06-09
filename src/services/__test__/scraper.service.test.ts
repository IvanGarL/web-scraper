import * as Chance from 'chance';
import { DateTime } from 'luxon';
import * as request from 'supertest';
import App from '../../app';
import { Roles } from '../../entities/User';
import { ScraperRoute } from '../../routes/scraper.route';
import * as Encryption from '../../utils/encryption';

const app = new App([new ScraperRoute()]);
const chance = new Chance();

describe('When sending a POST request to /scraper/website', () => {
    test('then it should scrap a website and save the <a> tags', async () => {
        jest.spyOn(Encryption, 'decodeToken').mockReturnValue({
            _id: chance.guid(),
            role: Roles.USER,
            email: 'ivangarl@yopmail.com',
            exp: DateTime.local().plus({ hours: 1 }).toJSDate(),
        });
        
        const response = await request(app.getServer()).post('/scraper/website').send({
            website: 'https://www.mock-website.com',
        });

        expect(response).toBe(1);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: 'Website scrapped successfully',
        });
    });
});
