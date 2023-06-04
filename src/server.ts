import 'reflect-metadata';
import App from './app';
import { UsersRoute } from './routes/users.route';
import { ScraperRoute } from './routes/scraper.route';

const app = new App([
    new UsersRoute(),
    new ScraperRoute(),
]);

app.listen();
