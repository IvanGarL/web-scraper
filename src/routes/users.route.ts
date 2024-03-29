import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import UsersService from '../services/users.service';

/**
 * Controller for the Users service
 */
export class UsersRoute implements Route {
    public path = '/users';
    public router = Router();
    public usersService: UsersService;

    constructor() {
        this.usersService = new UsersService();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.usersService.register);
        this.router.post(`${this.path}/logIn`, this.usersService.logIn);
    }
}
