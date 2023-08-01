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
     * @api {get} /website/all Get all the websites scraped by the user
     * @apiName GetScrapedWebsites
     * @apiGroup Website
     * @apiVersion  1.0.0
     * @apiPermission USER
     * @apiHeader {String} Authorization Bearer token
     * @apiParam  {Number} [page=1] Page number
     * @apiSuccess (200) {Object[]} websites List of websites
     * @apiSuccess (200) {String} websites.url Website url
     * @apiSuccess (200) {Number} websites.totalLinks Total links scraped from the website
     * @apiSuccess (200) {Number} pagesCount Total number of pages
     * @apiError (401) {String} message Unauthorized
     * @apiError (500) {String} message Internal server error
     * @apiSuccessExample {json} Success-Response:
     * {
     *   "websites": [
     *     {
     *          "url": "https://www.mock-website.com",
     *          "totalLinks": 10
     *     },
     *     {
     *          "url": "https://www.mock-website2.com",
     *          "totalLinks": 5
     *     }
     *   ],
     *   "pagesCount": 1
     * }
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
     * @api {get} /website/links Get all the links scraped from a website
     * @apiName GetWebsiteLinks
     * @apiGroup Website
     * @apiVersion  1.0.0
     * @apiPermission USER
     * @apiHeader {String} Authorization Bearer token
     * @apiParam  {String} website Website url
     * @apiParam  {Number} [page=1] Page number
     * @apiSuccess (200) {Object[]} links List of links
     * @apiSuccess (200) {String} links.name Link description
     * @apiSuccess (200) {String} links.url Link url
     * @apiSuccess (200) {Number} pagesCount Total number of pages
     * @apiError (401) {String} message Unauthorized
     * @apiError (500) {String} message Internal server error
     * @apiSuccessExample {json} Success-Response:
     * {
     *  "links": [
     *      {
     *          "name": "Mock link 1",
     *          "url": "https://www.mock-website.com/mock-link-1"
     *      },
     *      {
     *          "name": "Mock link 2",
     *          "url": "https://www.mock-website.com/mock-link-2"
     *      }
     *   ],
     *   "pagesCount": 1
     * }
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
