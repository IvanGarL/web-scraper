import * as Chance from 'chance';
import { EntityManager } from 'typeorm';
import { Roles, User } from '../entities/User';

export class UserFactory {
    private static chance = new Chance();

    /**
     * 
     * @param user 
     * @param manager 
     * @returns 
     */
    public static async createUser(user: Partial<User>, manager?: EntityManager): Promise<User> {
        let newUser = new User({
            email: user.email ?? this.chance.email(),
            name: user.name ?? this.chance.name().concat(' ', this.chance.last()),
            password: user.password ?? this.chance.string(),
            role: user.role ?? this.chance.pickone([Roles.USER, Roles.ADMIN]),
        });

        Object.assign(newUser, user);
        if (manager) newUser = await manager.save(User, newUser);

        return newUser;
    }
}
