import { Router } from 'express';

/**
 * Represents the components of a service routing endpoint
 */
interface Route {
    path: string;
    router: Router;
}

export default Route;
