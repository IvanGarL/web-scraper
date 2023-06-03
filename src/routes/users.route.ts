import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import UsersService from '../services/users.service';

// In MVC this could be a Controller
/**
 * Controller for the Users service
 */
export class UsersRoute implements Route {
    public path = '/users';
    public router = Router();
    public usersService = new UsersService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.usersService.register);
        this.router.post(`${this.path}/logIn`, this.usersService.logIn);
    }
}
