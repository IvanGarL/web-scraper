import { Roles } from 'entities/User';
import { Request } from 'express';

/**
 * Properties of the Decoded token
 * for authentication
 */
export interface DecodedToken {
    _id: string;
    email: string;
    role: Roles;
    exp: Date;
}

/**
 * Authenticated request
 */
export interface AuthRequest extends Request {
    decodedToken?: DecodedToken;
}
