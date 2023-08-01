import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Website } from './Website';

@Entity()
export class Link {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Website id */
    @Index()
    @Column('uuid')
    websiteId: string;

    /**
     * description of the scrapped tag
     */
    @Column({ type: 'text' })
    description: string;

    /**
     * url of the scrapped tag
     */
    @Column({ type: 'text' })
    url: string;

    /**
     * user linked to the scrapping request
     */
    @ManyToOne(() => Website, (p) => p.links)
    @JoinColumn({ name: 'website_id' })
    website: Website;

    /**
     * creation of the stock requested register
     */
    @CreateDateColumn()
    createdAt: Date;

    constructor(payload?: { description: string; url: string }) {
        if (payload) {
            this.description = payload.description;
            this.url = payload.url;
        }
    }
}
