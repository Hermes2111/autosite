import { MigrationInterface, QueryRunner } from "typeorm";
import { hash } from 'argon2';

export class SeedUsersAndModels1759345289091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const adminPassword = await hash('Admin1234!');
        const userPassword = await hash('User1234!');

        await queryRunner.query(
            `INSERT INTO users (email, name, password_hash, roles, "isActive")
             VALUES ($1, $2, $3, '{"admin","user"}', true)
             ON CONFLICT (email) DO NOTHING`,
            ['admin@example.com', 'Admin User', adminPassword],
        );

        await queryRunner.query(
            `INSERT INTO users (email, name, password_hash, roles, "isActive")
             VALUES ($1, $2, $3, '{"user"}', true)
             ON CONFLICT (email) DO NOTHING`,
            ['user@example.com', 'Demo User', userPassword],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users WHERE email IN ('admin@example.com', 'user@example.com')`);
    }

}
