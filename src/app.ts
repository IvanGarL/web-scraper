import * as express from 'express';
import { getConnection } from './database/db';
import Routes from './interfaces/routes.interface';
import errorMiddleware from './middlewares/error.middleware';
import 'dotenv/config'
class App {
    public app: express.Application;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = process.env.PORT || 8081;
        
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    public async listen() {
        await this.initializeConnection();
        this.app.listen(this.port, () => {
            console.log(`🚀 App listening on the port ${this.port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(require('cors')());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private async initializeConnection() {
        const db = await getConnection().catch(error => {
            console.log(error);
        });
       
    }
}

export default App;
