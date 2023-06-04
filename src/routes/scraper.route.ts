import { Router } from "express";
import Route from "../interfaces/routes.interface";
import ScraperService from "../services/scraper.service";

/**
 * Controller for the Scraper service
 */
export class ScraperRoute implements Route {
    public path = '/scraper';
    public router = Router();
    public scraperService = new ScraperService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/website`, this.scraperService.scrapeWebsite);
        // this.router.post(`${this.path}/`, this.scraperService.logIn);
    }
}