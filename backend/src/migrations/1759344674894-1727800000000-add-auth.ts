import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuth17278000000001759344674894 implements MigrationInterface {
    name = 'AddAuth17278000000001759344674894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diecast_models" DROP CONSTRAINT "diecast_models_teamId_fkey"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "model_driver_diecastModelId_fkey"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "model_driver_driverId_fkey"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "model_driver_pkey"`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "model_driver_pkey" PRIMARY KEY ("driverId")`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP COLUMN "diecastModelId"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "model_driver_pkey"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP COLUMN "driverId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" character varying array NOT NULL DEFAULT '{"user"}'`);
        await queryRunner.query(`ALTER TABLE "diecast_models" ADD "imageUrls" text array DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD "driversId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "PK_1464b30f4ff61aa4797ecc64fa9" PRIMARY KEY ("driversId")`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD "diecastModelsId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "PK_1464b30f4ff61aa4797ecc64fa9"`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "PK_1d8bd174c6b2e4d965e78c6ba8f" PRIMARY KEY ("driversId", "diecastModelsId")`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_1464b30f4ff61aa4797ecc64fa" ON "model_driver" ("driversId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f2ab679bbb8946357afa266ad" ON "model_driver" ("diecastModelsId") `);
        await queryRunner.query(`ALTER TABLE "diecast_models" ADD CONSTRAINT "FK_d3328c778519339774654530c41" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "FK_1464b30f4ff61aa4797ecc64fa9" FOREIGN KEY ("driversId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "FK_2f2ab679bbb8946357afa266adc" FOREIGN KEY ("diecastModelsId") REFERENCES "diecast_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "FK_2f2ab679bbb8946357afa266adc"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "FK_1464b30f4ff61aa4797ecc64fa9"`);
        await queryRunner.query(`ALTER TABLE "diecast_models" DROP CONSTRAINT "FK_d3328c778519339774654530c41"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f2ab679bbb8946357afa266ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1464b30f4ff61aa4797ecc64fa"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "PK_1d8bd174c6b2e4d965e78c6ba8f"`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "PK_1464b30f4ff61aa4797ecc64fa9" PRIMARY KEY ("driversId")`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP COLUMN "diecastModelsId"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "PK_1464b30f4ff61aa4797ecc64fa9"`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP COLUMN "driversId"`);
        await queryRunner.query(`ALTER TABLE "diecast_models" DROP COLUMN "imageUrls"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD "driverId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "model_driver_pkey" PRIMARY KEY ("driverId")`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD "diecastModelId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "model_driver" DROP CONSTRAINT "model_driver_pkey"`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "model_driver_pkey" PRIMARY KEY ("diecastModelId", "driverId")`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "model_driver_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "model_driver" ADD CONSTRAINT "model_driver_diecastModelId_fkey" FOREIGN KEY ("diecastModelId") REFERENCES "diecast_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "diecast_models" ADD CONSTRAINT "diecast_models_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
