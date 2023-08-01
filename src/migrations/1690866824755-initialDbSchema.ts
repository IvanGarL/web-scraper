import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDbSchema1690866824755 implements MigrationInterface {
    name = 'InitialDbSchema1690866824755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50), "email" character varying(50) NOT NULL, "password" character varying(100) NOT NULL, "role" "public"."user_role_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TABLE "website" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "url" character varying(500) NOT NULL, "times_consulted" integer NOT NULL DEFAULT '1', "last_consulted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_979e53e64186ccd315cf09b3b14" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3d649e45a6839b13478885388" ON "website" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "website_id" uuid NOT NULL, "description" text NOT NULL, "url" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5513c53903978946a961fcb011" ON "link" ("website_id") `);
        await queryRunner.query(`CREATE TABLE "page" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "url" character varying(500) NOT NULL, "times_consulted" integer NOT NULL DEFAULT '1', "last_consulted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_66f56dc20ab33adb20dc9992da" ON "page" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "website" ADD CONSTRAINT "FK_b3d649e45a6839b13478885388a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "link" ADD CONSTRAINT "FK_5513c53903978946a961fcb0112" FOREIGN KEY ("website_id") REFERENCES "website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "page" ADD CONSTRAINT "FK_66f56dc20ab33adb20dc9992dad" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page" DROP CONSTRAINT "FK_66f56dc20ab33adb20dc9992dad"`);
        await queryRunner.query(`ALTER TABLE "link" DROP CONSTRAINT "FK_5513c53903978946a961fcb0112"`);
        await queryRunner.query(`ALTER TABLE "website" DROP CONSTRAINT "FK_b3d649e45a6839b13478885388a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66f56dc20ab33adb20dc9992da"`);
        await queryRunner.query(`DROP TABLE "page"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5513c53903978946a961fcb011"`);
        await queryRunner.query(`DROP TABLE "link"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3d649e45a6839b13478885388"`);
        await queryRunner.query(`DROP TABLE "website"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
