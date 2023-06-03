import 'reflect-metadata';
import { StocksRoute } from './routes/stock.routes';
import App from './app';
import { UsersRoute } from './routes/users.route';

const app = new App([
    new UsersRoute(),
    // new StocksRoute(),
]);

app.listen();
