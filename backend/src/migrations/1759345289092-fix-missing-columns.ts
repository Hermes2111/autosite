import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMissingColumns1759345289092 implements MigrationInterface {
	name = 'FixMissingColumns1759345289092'

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Fix users table - handle both password and password_hash columns
		await queryRunner.query(`
			DO $$ 
			BEGIN
				-- If password column exists but password_hash doesn't, rename it
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') 
				   AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
					ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";
				END IF;
				
				-- If password_hash still doesn't exist, add it
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
					ALTER TABLE "users" ADD COLUMN "password_hash" VARCHAR;
				END IF;
				
				-- If password column still exists (and password_hash too), drop the old one
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') 
				   AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
					ALTER TABLE "users" DROP COLUMN "password";
				END IF;
				
				-- Add roles column if missing
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='roles') THEN
					ALTER TABLE "users" ADD COLUMN "roles" VARCHAR[] DEFAULT '{user}';
				END IF;
			END $$;
		`);

		// Add missing columns to diecast_models table
		await queryRunner.query(`
			DO $$ 
			BEGIN
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='imageUrls') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "imageUrls" TEXT[];
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='isSold') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "isSold" BOOLEAN DEFAULT false;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='soldDate') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "soldDate" TIMESTAMP;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='soldPrice') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "soldPrice" DECIMAL(10,2);
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='soldTo') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "soldTo" VARCHAR;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='customerId') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "customerId" INTEGER;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='soldLocation') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "soldLocation" VARCHAR;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='shippingCost') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "shippingCost" DECIMAL(10,2);
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='fees') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "fees" DECIMAL(10,2);
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='isPaid') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "isPaid" BOOLEAN DEFAULT false;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='saleNotes') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "saleNotes" TEXT;
				END IF;
				
				IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diecast_models' AND column_name='salesChannel') THEN
					ALTER TABLE "diecast_models" ADD COLUMN "salesChannel" VARCHAR;
				END IF;
			END $$;
		`);

		// Create watchlist_items table if not exists
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "watchlist_items" (
				"id" SERIAL PRIMARY KEY,
				"userId" INTEGER NOT NULL,
				"modelId" INTEGER NOT NULL REFERENCES diecast_models(id) ON DELETE CASCADE,
				"createdAt" TIMESTAMP NOT NULL DEFAULT now()
			)
		`);

		// Create customers table if not exists
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "customers" (
				"id" SERIAL PRIMARY KEY,
				"name" VARCHAR NOT NULL,
				"email" VARCHAR,
				"phone" VARCHAR,
				"address" VARCHAR,
				"city" VARCHAR,
				"country" VARCHAR,
				"notes" TEXT,
				"isRepeatCustomer" BOOLEAN DEFAULT false,
				"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
				"updatedAt" TIMESTAMP NOT NULL DEFAULT now()
			)
		`);

		// Create purchases table if not exists
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "purchases" (
				"id" SERIAL PRIMARY KEY,
				"customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
				"modelId" INTEGER REFERENCES diecast_models(id) ON DELETE SET NULL,
				"soldPrice" DECIMAL(10,2),
				"soldDate" TIMESTAMP,
				"salesChannel" VARCHAR,
				"what" VARCHAR,
				"year" VARCHAR,
				"createdAt" TIMESTAMP NOT NULL DEFAULT now()
			)
		`);

		console.log('✅ Migration: Missing columns added to existing tables');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Don't remove columns in down migration to avoid data loss
		console.log('Skipping down migration to preserve data');
	}
}

