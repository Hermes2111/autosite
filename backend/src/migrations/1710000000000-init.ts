import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1710000000000 implements MigrationInterface {
	name = 'Init1710000000000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY, "email" VARCHAR NOT NULL UNIQUE, "name" VARCHAR NOT NULL, "password_hash" VARCHAR NOT NULL, "roles" VARCHAR[] DEFAULT '{user}', "isActive" BOOLEAN DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "teams" ("id" SERIAL PRIMARY KEY, "name" VARCHAR NOT NULL UNIQUE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "drivers" ("id" SERIAL PRIMARY KEY, "firstName" VARCHAR NOT NULL, "lastName" VARCHAR NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "diecast_models" ("id" SERIAL PRIMARY KEY, "year" VARCHAR NOT NULL, "what" VARCHAR NOT NULL, "scale" VARCHAR, "specs" VARCHAR, "numbers" VARCHAR, "price" VARCHAR, "teamId" INTEGER REFERENCES teams(id) ON DELETE SET NULL, "imageUrls" TEXT[], "isSold" BOOLEAN DEFAULT false, "soldDate" TIMESTAMP, "soldPrice" DECIMAL(10,2), "soldTo" VARCHAR, "customerId" INTEGER, "soldLocation" VARCHAR, "shippingCost" DECIMAL(10,2), "fees" DECIMAL(10,2), "isPaid" BOOLEAN DEFAULT false, "saleNotes" TEXT, "salesChannel" VARCHAR, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "model_driver" ("diecastModelId" INTEGER NOT NULL REFERENCES diecast_models(id) ON DELETE CASCADE, "driverId" INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE, PRIMARY KEY ("diecastModelId", "driverId"))`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "watchlist_items" ("id" SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, "modelId" INTEGER NOT NULL REFERENCES diecast_models(id) ON DELETE CASCADE, "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "customers" ("id" SERIAL PRIMARY KEY, "name" VARCHAR NOT NULL, "email" VARCHAR, "phone" VARCHAR, "address" VARCHAR, "city" VARCHAR, "country" VARCHAR, "notes" TEXT, "isRepeatCustomer" BOOLEAN DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now())`);
		await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchases" ("id" SERIAL PRIMARY KEY, "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE, "modelId" INTEGER REFERENCES diecast_models(id) ON DELETE SET NULL, "soldPrice" DECIMAL(10,2), "soldDate" TIMESTAMP, "salesChannel" VARCHAR, "what" VARCHAR, "year" VARCHAR, "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "purchases"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "watchlist_items"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "model_driver"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "diecast_models"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "drivers"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
	}
}

