import { MigrationInterface, QueryRunner } from "typeorm";

export class SettingsRequireVerification1762163456378 implements MigrationInterface {
    name = 'SettingsRequireVerification1762163456378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "require_verification" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "require_verification"`);
    }

}
