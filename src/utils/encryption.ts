import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import HttpError from '../exceptions/HttpException';
import { DecodedToken } from '../interfaces/token.interface';

/**
 * Hashes a password using bcrypt and a salt of 10 rounds
 * @param {string} password plain text password
 * @returns {string} hashed password
 */
export const getHashedPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Validates if a plain text password matches a hashed password
 * @param {string} inputPassword 
 * @param {string} hashedPassword 
 */
export const passwordMatch = (inputPassword: string, hashedPassword: string) => {
    if (!bcrypt.compareSync(inputPassword, hashedPassword)) {
        throw new HttpError(400, 'Password does not match');
    }
};

/**
 * Generates a JWT token using the user information and RSA256 algorithm
 * with asymmetric keys
 * @param {User} user information to be encoded in the token 
 * @returns {string} JWT token
 */
export const generateJWT = (user: User): string => {
    const superSecretKey = process.env.SECRET_KEY;

    const options: jwt.SignOptions = { algorithm: 'RS256' };
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        superSecretKey,
        options,
    );
    return token;
};

/**
 * Decodes a JWT token using the public key and RSA256 algorithm
 * @param {string} token 
 * @returns {DecodedToken}
 */
export const decodeToken = (token: string): DecodedToken => {
    const publicKey = process.env.PUBLIC_KEY;

    const decoded: any = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    return {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp,
    };
};
