import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Link } from "./Link";

@Entity()
export class Page {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * url of the page
     */
    @Column({ length: 128 })
    url: string;

    /**
     * times the page has been consulted
     */
    @Column({ default: 1 })
    timesConsulted: number;

    /**
     * user linked to the scrapping request
     */
    @ManyToOne(
        () => User,
        u => u.pageRequestHistory,
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    /**
     * user linked to the scrapping request
     */
    @OneToMany(
        () => Link,
        l => l.page,
    )
    links: Link[];

    /**
     * creation of the request
     */
    @CreateDateColumn()
    createdAt: Date;
}