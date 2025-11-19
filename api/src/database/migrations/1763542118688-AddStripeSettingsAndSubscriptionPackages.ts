import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeSettingsAndSubscriptionPackages1763542118688 implements MigrationInterface {
    name = 'AddStripeSettingsAndSubscriptionPackages1763542118688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum" RENAME TO "permissions_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('users', 'settings', 'ai_models', 'questions', 'reports')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum" USING "resource"::"text"::"public"."permissions_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" RENAME TO "audit_logs_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('user_suspended', 'user_reactivated', 'user_created', 'user_updated', 'user_deleted', 'user_role_changed', 'paper_approved', 'paper_rejected', 'paper_suspended', 'paper_taken_down', 'paper_reactivated', 'payout_approved', 'payout_rejected', 'payout_processed', 'report_resolved', 'report_dismissed', 'settings_updated', 'credit_package_created', 'credit_package_updated', 'credit_package_deleted', 'ai_model_created', 'ai_model_updated', 'ai_model_deleted', 'ai_model_default_set', 'ai_model_api_key_viewed', 'ai_model_connection_tested', 'admin_created', 'admin_role_assigned', 'admin_permissions_changed', 'role_created', 'role_updated', 'role_deleted', 'subscription_package_created', 'subscription_package_updated', 'subscription_package_deleted', 'stripe_settings_updated', 'stripe_connection_tested', 'created', 'updated', 'deleted')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum" USING "action"::"text"::"public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_targettype_enum" RENAME TO "audit_logs_targettype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_targettype_enum" AS ENUM('user', 'paper', 'report', 'payout', 'settings', 'ai_model', 'credit_package', 'role', 'permission', 'admin', 'subscription_package', 'stripe_settings')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "targetType" TYPE "public"."audit_logs_targettype_enum" USING "targetType"::"text"::"public"."audit_logs_targettype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_targettype_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_targettype_enum_old" AS ENUM('user', 'paper', 'report', 'payout', 'settings', 'ai_model', 'credit_package', 'role', 'permission', 'admin')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "targetType" TYPE "public"."audit_logs_targettype_enum_old" USING "targetType"::"text"::"public"."audit_logs_targettype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_targettype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_targettype_enum_old" RENAME TO "audit_logs_targettype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum_old" AS ENUM('user_suspended', 'user_reactivated', 'user_created', 'user_updated', 'user_deleted', 'user_role_changed', 'paper_approved', 'paper_rejected', 'paper_suspended', 'paper_taken_down', 'paper_reactivated', 'payout_approved', 'payout_rejected', 'payout_processed', 'report_resolved', 'report_dismissed', 'settings_updated', 'credit_package_created', 'credit_package_updated', 'credit_package_deleted', 'ai_model_created', 'ai_model_updated', 'ai_model_deleted', 'ai_model_default_set', 'ai_model_api_key_viewed', 'ai_model_connection_tested', 'admin_created', 'admin_role_assigned', 'admin_permissions_changed', 'role_created', 'role_updated', 'role_deleted')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum_old" USING "action"::"text"::"public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum_old" RENAME TO "audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum_old" AS ENUM('users', 'settings', 'ai_models', 'reports')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum_old" USING "resource"::"text"::"public"."permissions_resource_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum_old" RENAME TO "permissions_resource_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
    }

}
