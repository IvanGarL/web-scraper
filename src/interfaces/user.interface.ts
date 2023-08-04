import { Roles } from 'entities/User';

/**
 * Payload for the User register request
 */
export interface UserSignUpRequest {
    name?: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

/**
 * Payload for the User logIn request
 */
export interface UserLogInRequest {
    email: string;
    password: string;
}

/**
 * Payload for the User register response
 */
export interface UserSignUpResponse {
    token: string;
    email: string;
    role: Roles;
}
