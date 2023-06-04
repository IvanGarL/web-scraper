import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import WebsiteService from '../services/website.service';

/**
 * Controller for the Website service
 */
export class WebsiteRoute implements Route {
    public path = '/website';
    public router = Router();
    public websiteService = new WebsiteService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/all`, this.websiteService.getScrapedWebsites);
        this.router.get(`${this.path}/links`, this.websiteService.getWebsiteLinks);
    }
}
