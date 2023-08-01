import * as Chance from 'chance';
import { EntityManager } from 'typeorm';
import { Website } from '../entities/Website';

export class WebsiteFactory {
    private static chance = new Chance();

    /**
     * 
     * @param website 
     * @param manager 
     * @returns 
     */
    public static async createWebsite(website: Partial<Website>, manager?: EntityManager): Promise<Website> {
        let newWebsite = new Website(website.url ?? this.chance.url());

        Object.assign(newWebsite, website);
        if (manager) newWebsite = await manager.save(Website, newWebsite);

        return newWebsite;
    }
}
