import { MigrationInterface, QueryRunner } from "typeorm";

export class Watchlist17278010000001759349518274 implements MigrationInterface {
    name = 'Watchlist17278010000001759349518274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "watchlist_items" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "modelId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6cb06c0efe373b853b26971ac39" UNIQUE ("userId", "modelId"), CONSTRAINT "PK_0a02323c5cc02e094871f24062b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT '{"user"}'`);
        await queryRunner.query(`ALTER TABLE "watchlist_items" ADD CONSTRAINT "FK_1d44d0b2e52ecad244c712dfafa" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watchlist_items" ADD CONSTRAINT "FK_82b41ff0386196c651cf20e1233" FOREIGN KEY ("modelId") REFERENCES "diecast_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watchlist_items" DROP CONSTRAINT "FK_82b41ff0386196c651cf20e1233"`);
        await queryRunner.query(`ALTER TABLE "watchlist_items" DROP CONSTRAINT "FK_1d44d0b2e52ecad244c712dfafa"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT '{user}'`);
        await queryRunner.query(`DROP TABLE "watchlist_items"`);
    }
}
