import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import HttpError from '../exceptions/HttpException';
import { DecodedToken } from '../interfaces/token.interface';

/**
 * 
 * @param password 
 * @returns 
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * 
 * @param inputPassword 
 * @param hashedPassword 
 */
export const passwordMatch = (inputPassword: string, hashedPassword: string) => {
    if (!bcrypt.compareSync(inputPassword, hashedPassword)) {
        throw new HttpError(400, 'Password does not match');
    }
};

/**
 * 
 * @param user 
 * @returns 
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
 * 
 * @param token 
 * @returns 
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
