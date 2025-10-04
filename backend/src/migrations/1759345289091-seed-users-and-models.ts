import { MigrationInterface, QueryRunner } from "typeorm";
import { hash } from 'argon2';

export class SeedUsersAndModels1759345289091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Skip seeding - admin user already exists from manual SQL setup
        console.log('Skipping user seeding - admin user already exists');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Skip seeding down - admin user already exists from manual SQL setup
        console.log('Skipping user seeding down - admin user already exists');
    }

}
