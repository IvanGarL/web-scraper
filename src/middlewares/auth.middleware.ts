import { Response } from 'express';
import * as J from 'joi';
import { EntityManager } from 'typeorm';
import { DatabaseConnection } from '../database/db';
import { Roles } from '../entities/User';
import HttpError from '../exceptions/HttpException';
import { AuthRequest, DecodedToken } from '../interfaces/token.interface';
import { decodeToken } from '../utils/encryption';

/**
 * Middleware options
 */
interface Middleware {
    bodyValidation?: J.ObjectSchema;
    queryValidation?: J.ObjectSchema;
    roles?: Roles[];
    validateToken: boolean;
    handler: (req: AuthRequest, res: Response, db: EntityManager) => Promise<any>;
}

/**
 * Validate the role for a requested service
 * @param allowedRoles Allowed roles to access a service
 * @param userRole role of the user trying to access
 */
const validateRoles = (allowedRoles: Roles[], userRole: Roles) => {
    const isAllowed = allowedRoles.find((r) => r === userRole);
    if (!isAllowed) throw new HttpError(403, 'Forbidden access to this service for this user');
};

/**
 * Wraps the business logic executed for a specific service in the server
 * Connects to the database and makes user-authentication
 * @param {AuthRequest} req
 * @param {Response} res
 * @param {Middleware} middleware
 */
export const authMiddleware = async (req: AuthRequest, res: Response, middleware: Middleware) => {
    // connect to dabatase
    let manager: EntityManager;
    try {
        const connection = await DatabaseConnection.getInstance();
        manager = await connection.getConnectionManager();
    } catch (e) {
        console.error('Error connecting to database', e);
        return res.status(e.status ? e.status : 500).send({ error: e.message });
    }

    // validate token and role
    const token = req.headers.authorization;
    if (token || middleware.validateToken) {
        let decodedToken: DecodedToken;
        try {
            decodedToken = decodeToken(token);
            req.decodedToken = decodedToken;
        } catch (error) {
            console.error('Error authenticating user', error);
            return res.status(401).send({ error: 'Error authenticating user '.concat(error) });
        }
        if (middleware.roles) {
            const userRole = decodedToken.role;
            try {
                validateRoles(middleware.roles, userRole);
            } catch (error) {
                console.error('Error authenticating user', error);
                return res.status(error.status).send({ error: error.message });
            }
        }
    }

    // validate body
    if (middleware.bodyValidation) {
        const { error } = middleware.bodyValidation.validate(req.body);
        if (error) return res.status(400).send({ error: 'Request body Validation Error\n'.concat(error.message) });
    }
    // validate queryParams
    if (middleware.queryValidation) {
        const { error } = middleware.queryValidation.validate(req.query);
        if (error)
            return res.status(400).send({ error: 'Request query params Validation Error\n'.concat(error.message) });
    }
    console.log(req.hostname, req.originalUrl, req.path, req.body, req.method, req.headers);

    // run service after validations
    return await middleware.handler(req, res, manager).catch((error: HttpError) => {
        console.error(error);
        res.status(error.status ?? 500).send({ error: error.message });
    });
};
