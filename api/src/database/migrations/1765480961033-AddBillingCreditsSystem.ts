import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingCreditsSystem1765480961033 implements MigrationInterface {
    name = 'AddBillingCreditsSystem1765480961033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_packages" ADD "monthly_credits" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "subscription_packages" ADD "credit_multiplier" numeric(3,2) NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum" RENAME TO "permissions_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('users', 'settings', 'ai_models', 'questions', 'reports', 'billing')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum" USING "resource"::"text"::"public"."permissions_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum_old" AS ENUM('ai_models', 'questions', 'reports', 'settings', 'users')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum_old" USING "resource"::"text"::"public"."permissions_resource_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum_old" RENAME TO "permissions_resource_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
        await queryRunner.query(`ALTER TABLE "subscription_packages" DROP COLUMN "credit_multiplier"`);
        await queryRunner.query(`ALTER TABLE "subscription_packages" DROP COLUMN "monthly_credits"`);
    }

}
