import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1710000000000 implements MigrationInterface {
	name = 'Init1710000000000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY, "email" VARCHAR NOT NULL UNIQUE, "name" VARCHAR NOT NULL, "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "teams" ("id" SERIAL PRIMARY KEY, "name" VARCHAR NOT NULL UNIQUE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "drivers" ("id" SERIAL PRIMARY KEY, "firstName" VARCHAR NOT NULL, "lastName" VARCHAR NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "diecast_models" ("id" SERIAL PRIMARY KEY, "year" VARCHAR NOT NULL, "what" VARCHAR NOT NULL, "scale" VARCHAR, "specs" VARCHAR, "numbers" VARCHAR, "price" VARCHAR, "teamId" INTEGER REFERENCES teams(id) ON DELETE SET NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "model_driver" ("diecastModelId" INTEGER NOT NULL REFERENCES diecast_models(id) ON DELETE CASCADE, "driverId" INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE, PRIMARY KEY ("diecastModelId", "driverId"))`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "model_driver"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "diecast_models"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "drivers"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
	}
}

