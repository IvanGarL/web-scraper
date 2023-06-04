import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { Link } from '../entities/Link';
import { Roles } from '../entities/User';
import { Website } from '../entities/Website';
import { AuthRequest } from '../interfaces/token.interface';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PaginationUtils } from '../utils/pagination';

export default class WebsiteService {
    /**
     * Gets all the scraped websites from the user
     * @param req http request
     * @param res http server response
     */
    getScrapedWebsites = async (req: AuthRequest, res: Response): Promise<void> => {
        const getScrapedWebsitesValidation = J.object({
            page: J.number().min(1).default(1).required(),
        });
        return authMiddleware(req, res, {
            roles: [Roles.USER],
            validateToken: true,
            queryValidation: getScrapedWebsitesValidation,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { _id } = req.decodedToken;
                const { page } = req.query ?? {};

                const websitesQuery = manager
                    .createQueryBuilder(Website, 'website')
                    .innerJoinAndSelect('website.links', 'links')
                    .where('website.userId = :userId', { userId: _id })
                    .orderBy('website.lastConsultedAt', 'DESC');

                const websiteResults = await PaginationUtils.getPageOfQuery({
                    query: websitesQuery,
                    orderingField: 'lastConsultedAt',
                    entityAlias: 'website',
                    page: Number(page ?? 1),
                });

                const websites = websiteResults.currentPage.map((w) => ({
                    url: w.url,
                    totalLinks: w.links.length,
                }));

                // Send response
                res.status(200).send({ websites, pagesCount: websiteResults.pagesCount });
            },
        });
    };

    /**
     * Get the links from a website scraped by the user
     * @param req http request
     * @param res http server response
     */
    getWebsiteLinks = async (req: AuthRequest, res: Response): Promise<void> => {
        const getWebsiteLinksBodyValidation = J.object({
            website: J.string().uri().required(),
        });
        const getWebsiteLinksQueryValidation = J.object({
            page: J.number().min(1).default(1).required(),
        });
        return authMiddleware(req, res, {
            roles: [Roles.USER],
            validateToken: true,
            bodyValidation: getWebsiteLinksBodyValidation,
            queryValidation: getWebsiteLinksQueryValidation,
            handler: async (req: AuthRequest, res: Response, manager: EntityManager) => {
                const { _id } = req.decodedToken;
                const { website } = req.body;
                const { page } = req.query ?? {};

                const linksQuery = manager
                    .createQueryBuilder(Link, 'links')
                    .innerJoinAndSelect('links.website', 'website')
                    .where('website.userId = :userId', { userId: _id })
                    .andWhere('website.url = :url', { url: website })
                    .orderBy('links.id', 'DESC');

                const linksResults = await PaginationUtils.getPageOfQuery({
                    query: linksQuery,
                    orderingField: 'id',
                    entityAlias: 'links',
                    page: Number(page ?? 1),
                });

                const links = linksResults.currentPage.map((l) => ({
                    name: l.description,
                    url: l.url,
                }));

                // Send response
                res.status(200).send({ links, pagesCount: linksResults.pagesCount });
            },
        });
    };
}
