import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Page } from './Page';


@Entity()
export class Link {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
    @ManyToOne(
        () => Page,
        p => p.links,
    )
    @JoinColumn({ name: 'page_id' })
    page: Page;

    /**
     * creation of the stock requested register
     */
    @CreateDateColumn()
    createdAt: Date;
}