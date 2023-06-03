import { Chance } from 'chance';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from './Page';

/**
 * Enum of the available roles for a user
 */
export enum Roles {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * name of the user
     */
    @Column({ length: 50, nullable: true })
    name?: string;

    /**
     * email of the user
     */
    @Index({ unique: true })
    @Column({ length: 50, unique: true })
    email: string;

    /**
     * hashed password
     */
    @Column({ length: 100 })
    password: string;

    /**
     * role of the user
     */
    @Column({ type: 'enum', enum: Roles })
    role: Roles;

    /**
     * Requests history of the scraped pages
     */
    @OneToMany(
        () => Page,
        s => s.user,
    )
    pageRequestHistory: Page[];

    /**
     * Date of creation of the user
     */
    @CreateDateColumn()
    createdAt: Date;

    constructor(
        name: string,
        email: string,
        password: string,
        role: Roles,
    ) {
        this.id = new Chance().guid();
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
        return this;
    }
}
