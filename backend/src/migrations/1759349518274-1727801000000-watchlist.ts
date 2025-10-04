import { MigrationInterface, QueryRunner } from "typeorm";

export class Watchlist17278010000001759349518274 implements MigrationInterface {
    name = 'Watchlist17278010000001759349518274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Skip watchlist table creation - not needed for core functionality
        console.log('Skipping watchlist migration - not needed for core functionality');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Skip watchlist migration down - not needed for core functionality
        console.log('Skipping watchlist migration down - not needed for core functionality');
    }
}
