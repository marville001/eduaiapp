import { MigrationInterface, QueryRunner } from "typeorm";

export class TokenUsageUpdates1765901327456 implements MigrationInterface {
    name = 'TokenUsageUpdates1765901327456';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "input_cost_per_1k_tokens" numeric(10,4) NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "output_cost_per_1k_tokens" numeric(10,4) NOT NULL DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "minimum_credits" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ADD "model_multiplier" numeric(5,2) NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" ADD "input_tokens" integer`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" ADD "output_tokens" integer`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" ADD "total_tokens" integer`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" ADD "ai_model" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" ADD "token_cost_breakdown" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit_transactions" DROP COLUMN "token_cost_breakdown"`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" DROP COLUMN "ai_model"`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" DROP COLUMN "total_tokens"`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" DROP COLUMN "output_tokens"`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" DROP COLUMN "input_tokens"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "model_multiplier"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "minimum_credits"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "output_cost_per_1k_tokens"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" DROP COLUMN "input_cost_per_1k_tokens"`);
    }

}
