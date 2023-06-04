import 'reflect-metadata';
import App from './app';
import { ScraperRoute } from './routes/scraper.route';
import { UsersRoute } from './routes/users.route';
import { WebsiteRoute } from './routes/website.route';

const app = new App([new UsersRoute(), new ScraperRoute(), new WebsiteRoute()]);

app.listen();
