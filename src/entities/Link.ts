import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from './Page';

@Entity()
export class Link {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Page id */
    @Index()
    @Column('uuid')
    pageId: string;

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
    @ManyToOne(() => Page, (p) => p.links)
    @JoinColumn({ name: 'page_id' })
    page: Page;

    /**
     * creation of the stock requested register
     */
    @CreateDateColumn()
    createdAt: Date;

    constructor(description: string, url: string) {
        this.description = description;
        this.url = url;
    }
}
