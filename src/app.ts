import 'dotenv/config';
import * as express from 'express';
import { EntityManager } from 'typeorm';
import { DatabaseConnection } from './database/db';
import Routes from './interfaces/routes.interface';
import errorMiddleware from './middlewares/error.middleware';
class App {
    public app: express.Application;
    public port: string | number;
    public databaseConnection: DatabaseConnection;

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

    public getServer(): express.Application {
        return this.app;
    }

    public getDatabaseManager(): EntityManager {
        return this.databaseConnection.getConnectionManager();
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
        try {
            this.databaseConnection = await DatabaseConnection.getInstance();
        } catch (error) {
            console.log('Error connecting to db', error);
        }
    }
}

export default App;
