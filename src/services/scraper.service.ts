import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { Roles } from '../entities/User';
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
                this.scraper.scrapeWebsite(website);
                // Send response
                res.status(200).send({ message: 'Scraping website' });
            },
        });
    };
}
