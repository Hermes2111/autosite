import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuth17278000000001759344674894 implements MigrationInterface {
    name = 'AddAuth17278000000001759344674894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Skip this migration - tables already exist from manual SQL setup
        // This prevents conflicts with existing database structure
        console.log('Skipping AddAuth migration - database already initialized');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Skip this migration - tables already exist from manual SQL setup
        console.log('Skipping AddAuth migration down - database already initialized');
    }

}
