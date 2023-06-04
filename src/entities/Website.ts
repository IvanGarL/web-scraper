import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Link } from './Link';
import { User } from './User';

@Entity()
export class Website {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** User id */
    @Index()
    @Column('uuid')
    userId: string;

    /**
     * url of the website
     */
    @Column({ type: 'varchar', length: 500 })
    url: string;

    /**
     * times the website has been consulted
     */
    @Column({ default: 1 })
    timesConsulted: number;

    /**
     * last time the website was consulted
     */
    @Column({ nullable: true })
    lastConsultedAt: Date;

    /**
     * creation of the request
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * user linked to the scrapping request
     */
    @ManyToOne(() => User, (u) => u.websiteHistory)
    @JoinColumn({ name: 'user_id' })
    user: User;

    /**
     * user linked to the scrapping request
     */
    @OneToMany(() => Link, (l) => l.website)
    links: Link[];

    constructor(url: string) {
        this.url = url;
        this.lastConsultedAt = new Date();
    }
}
