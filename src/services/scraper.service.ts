import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { Link } from '../entities/Link';
import { Page } from '../entities/Page';
import { Roles, User } from '../entities/User';
import HttpError from '../exceptions/HttpException';
import { AuthRequest } from '../interfaces/token.interface';
import { authMiddleware } from '../middlewares/auth.middleware';
import { WebsiteScraper } from '../utils/scraper';

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
        const scrapeWensiteValidation = J.object({
            website: J.string().uri().required(),
        });
        return authMiddleware(req, res, {
            bodyValidation: scrapeWensiteValidation,
            roles: [Roles.USER],
            validateToken: true,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { website } = req.body;
                const { _id } = req.decodedToken;

                const scrapedWebsite = await manager.findOne(Page, { where: { url: website, userId: _id } });
                if (scrapedWebsite) {
                    await manager.update(
                        Page,
                        { url: website, userId: _id },
                        { timesConsulted: scrapedWebsite.timesConsulted + 1, lastConsultedAt: new Date() },
                    );
                    throw new HttpError(400, 'Website already scraped');
                }

                try {
                    console.log('Scraping website: ', website);
                    await manager.transaction(async (tmanager) => {
                        const [user, _] = await Promise.all([
                            tmanager.findOne(User, { where: { id: _id } }),
                            this.scraper.scrapeWebsite(website),
                        ]);
                        
                        const page = new Page(website);
                        page.user = user;
                        await tmanager.save(Page, page);

                        let dbLinks: Link[] = [];
                        const links = this.scraper.getLinks();
                        for (const [description, url] of links.entries()) {
                            const link = new Link(description, url);
                            link.page = page;
                            dbLinks.push(link);
                        }
                        await tmanager.save(Link, dbLinks);
                    });
                } catch (error) {
                    console.error('Error scraping website: ', error);
                    throw new HttpError(400, `Error scraping website ${error}`);
                }

                // Send response
                res.status(200).send({ message: `Saved scraped website ${website}` });
            },
        });
    };
}
