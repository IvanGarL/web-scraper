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
    const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDZnTCMMH7qOoGxTRdjxc24nCd+
BYUWYc6czU2CX3Q8LVo5NCNWurOeNvVqi63BnO/S+5x8Vh04CZRK9Pz3LP/5xP/S
rurC+YbQ9ELzoxX74aZ0Ut10V5aK5Zcu5TZVnZqDld6bkUnBk6NDGe9V2FK50Mad
y0U7c8sO0jrvj3uzcwIDAQAB
-----END PUBLIC KEY-----`;

    const publicKeyBuffer = Buffer.from(publicKey, 'utf-8');
    const decoded: any = jwt.verify(token, publicKeyBuffer);

    return {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp,
    };
};
