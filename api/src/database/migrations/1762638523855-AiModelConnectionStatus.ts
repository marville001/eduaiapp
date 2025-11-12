import { MigrationInterface, QueryRunner } from "typeorm";

export class AiModelConnectionStatus1762638523855 implements MigrationInterface {
    name = 'AiModelConnectionStatus1762638523855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "last_connection_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "last_connection_successful" boolean`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "last_connection_error" text`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "last_connection_error"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "last_connection_successful"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "last_connection_at"`);
    }

}
