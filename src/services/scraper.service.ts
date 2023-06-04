import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { Link } from '../entities/Link';
import { Roles, User } from '../entities/User';
import { Website } from '../entities/Website';
import HttpError from '../exceptions/HttpException';
import { AuthRequest } from '../interfaces/token.interface';
import { authMiddleware } from '../middlewares/auth.middleware';
import { WebsiteScraper } from '../utils/scraper';
import { DateTime } from 'luxon';

export default class ScraperService {
    private scraper: WebsiteScraper;

    constructor() {
        this.scraper = new WebsiteScraper();
    }

    /**
     *
     * @param req
     * @param res
     * @returns
     */
    scrapeWebsite = async (req: AuthRequest, res: Response): Promise<void> => {
        const scrapeWebsiteValidation = J.object({
            website: J.string().uri().required(),
        });
        return authMiddleware(req, res, {
            bodyValidation: scrapeWebsiteValidation,
            roles: [Roles.USER],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { website } = req.body;
                const { _id } = req.decodedToken;

                const scrapedWebsite = await manager.findOne(Website, { where: { url: website, userId: _id } });
                const lastDateConsultedDiff = DateTime.fromJSDate(new Date()).diffNow('hours').hours;
                if (scrapedWebsite && lastDateConsultedDiff < 24) {
                    await manager.update(
                        Website,
                        { url: website, userId: _id },
                        { timesConsulted: scrapedWebsite.timesConsulted + 1, lastConsultedAt: new Date() },
                    );
                    throw new HttpError(400, 'Website already scraped');
                }
                else if (scrapedWebsite) {
                    await manager.update(
                        Website,
                        { url: website, userId: _id },
                        { timesConsulted: scrapedWebsite.timesConsulted + 1, lastConsultedAt: new Date() },
                    );
                }

                try {
                    console.log('Scraping website: ', website);
                    await manager.transaction(async (tmanager) => {
                        const [user, _] = await Promise.all([
                            tmanager.findOne(User, { where: { id: _id } }),
                            this.scraper.scrapeWebsite(website),
                        ]);

                        const dbWebsite = new Website(website);
                        dbWebsite.user = user;
                        await tmanager.save(Website, dbWebsite);

                        let dbLinks: Link[] = [];
                        const links = this.scraper.getLinks();
                        for (const [description, url] of links) {
                            const link = new Link(description, url);
                            link.website = dbWebsite;
                            dbLinks.push(link);
                        }
                        await tmanager.save(Link, dbLinks);
                    });
                } catch (error) {
                    console.error('Error scraping website: ', error);
                    throw new HttpError(400, `Error scraping website ${error}`);
                }

                // Send response
                res.status(200).send({ message: `Saved scraped website: ${website}` });
            },
        });
    };
}
