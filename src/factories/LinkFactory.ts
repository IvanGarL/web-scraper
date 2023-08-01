import * as Chance from 'chance';
import { EntityManager } from 'typeorm';
import { Link } from '../entities/Link';

export class LinkFactory {
    private static chance = new Chance();

    /**
     * 
     * @param link 
     * @param manager 
     * @returns 
     */
    public static async createLink(link: Partial<Link>, manager?: EntityManager): Promise<Link> {
        let newLink = new Link({
            url: link.url ?? this.chance.url(),
            description: link.description ?? this.chance.string(),
        });

        Object.assign(newLink, link);
        if (manager) newLink = await manager.save(Link, newLink);

        return newLink;
    }
}
