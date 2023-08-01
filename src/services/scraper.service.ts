import { Response } from 'express';
import * as J from 'joi';
import { DateTime } from 'luxon';
import { EntityManager } from 'typeorm';
import { Link } from '../entities/Link';
import { Roles, User } from '../entities/User';
import { Website } from '../entities/Website';
import HttpError from '../exceptions/HttpException';
import { AuthRequest } from '../interfaces/token.interface';
import { authMiddleware } from '../middlewares/auth.middleware';
import { WebsiteScraper } from '../utils/scraper';

/**
 * Controller for the Scraper service
 */
export default class ScraperService {
    private scraper: WebsiteScraper;

    constructor() {
        this.scraper = new WebsiteScraper();
    }

    /**
     * Loads the links from the scraper to the database
     * and associate them with the respective website
     * @param {EntityManager} manager
     * @param {Website} website
     */
    private async loadLinksToWebsite(manager: EntityManager, website: Website): Promise<void> {
        await this.scraper.scrapeWebsite(website.url);

        let dbLinks: Link[] = [];
        const links = this.scraper.getLinks();
        for (const [description, url] of links) {
            const link = new Link(description, url);
            link.website = website;
            dbLinks.push(link);
        }
        await manager.save(Link, dbLinks);
    }

    /**
     * @api {post} /scraper/website Scrapes a website and saves it to the database
     * @apiName ScrapeWebsite
     * @apiGroup Scraper
     * @apiVersion  1.0.0
     * @apiPermission USER
     * @apiHeader {String} Authorization Bearer token
     * @apiParam  {String} website Website to scrape
     * @apiSuccess (200) {String} message Website scraped successfully
     * @apiError (400) {String} message Error scraping website
     * @apiError (400) {String} message Website already scraped
     * @apiError (401) {String} message Unauthorized
     * @apiError (500) {String} message Internal server error
     * @apiSuccessExample {json} Success-Response:
     * {
     *    "message": "Website scraped successfully"
     * }
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
                const lastDateConsultedDiff = scrapedWebsite
                    ? DateTime.fromJSDate(scrapedWebsite.lastConsultedAt).diffNow('hours').hours
                    : 0;
                if (scrapedWebsite && lastDateConsultedDiff < 24) {
                    await manager.update(
                        Website,
                        { url: website, userId: _id },
                        { timesConsulted: scrapedWebsite.timesConsulted + 1, lastConsultedAt: new Date() },
                    );
                    throw new HttpError(400, 'Website already scraped');
                } else if (scrapedWebsite) {
                    await manager.update(
                        Website,
                        { url: website, userId: _id },
                        { timesConsulted: scrapedWebsite.timesConsulted + 1, lastConsultedAt: new Date(), links: [] },
                    );

                    await this.loadLinksToWebsite(manager, scrapedWebsite);
                } else {
                    try {
                        console.log('Scraping website: ', website);
                        await manager.transaction(async (tmanager) => {
                            const user = await tmanager.findOne(User, { where: { id: _id } });

                            const dbWebsite = new Website(website);
                            dbWebsite.user = user;
                            await tmanager.save(Website, dbWebsite);

                            await this.loadLinksToWebsite(tmanager, dbWebsite);
                        });
                    } catch (error) {
                        console.error('Error scraping website: ', error);
                        throw new HttpError(400, `Error scraping website ${error}`);
                    }
                }

                // Send response
                res.status(200).send({ message: `Saved scraped website: ${website}` });
            },
        });
    };
}
