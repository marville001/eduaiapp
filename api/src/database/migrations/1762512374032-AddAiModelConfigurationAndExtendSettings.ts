import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiModelConfigurationAndExtendSettings1762512374032 implements MigrationInterface {
    name = 'AddAiModelConfigurationAndExtendSettings1762512374032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ai_model_configurations_provider_enum" AS ENUM('openai', 'anthropic', 'google', 'custom')`);
        await queryRunner.query(`CREATE TABLE "ai_model_configurations" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "model_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "public"."ai_model_configurations_provider_enum" NOT NULL, "model_name" character varying(100) NOT NULL, "display_name" character varying(100) NOT NULL, "description" text, "api_endpoint" character varying(500), "api_key_encrypted" text, "is_default" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "max_tokens" integer NOT NULL DEFAULT '4000', "temperature" numeric(3,2) NOT NULL DEFAULT '0.7', "top_p" numeric(3,2) NOT NULL DEFAULT '1', "frequency_penalty" numeric(3,2) NOT NULL DEFAULT '0', "presence_penalty" numeric(3,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_1752f5edf258dc659e1e7d110a4" PRIMARY KEY ("id", "model_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3f031aa06c5e9557a8ce1fd591" ON "ai_model_configurations" ("id") `);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "app_logo" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "app_favicon" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "contact_phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "contact_address" text`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "social_facebook" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "social_twitter" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "social_linkedin" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "social_instagram" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "max_file_upload_size" integer NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "allowed_file_types" text`);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD "default_ai_model_id" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum" RENAME TO "permissions_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('users', 'settings', 'ai_models', 'reports')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum" USING "resource"::"text"::"public"."permissions_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_action_enum" RENAME TO "permissions_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum" AS ENUM('create', 'read', 'update', 'delete', 'suspend', 'export', 'view_sensitive')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "action" TYPE "public"."permissions_action_enum" USING "action"::"text"::"public"."permissions_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" RENAME TO "audit_logs_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('user_suspended', 'user_reactivated', 'user_created', 'user_updated', 'user_deleted', 'user_role_changed', 'paper_approved', 'paper_rejected', 'paper_suspended', 'paper_taken_down', 'paper_reactivated', 'payout_approved', 'payout_rejected', 'payout_processed', 'report_resolved', 'report_dismissed', 'settings_updated', 'credit_package_created', 'credit_package_updated', 'credit_package_deleted', 'ai_model_created', 'ai_model_updated', 'ai_model_deleted', 'ai_model_default_set', 'ai_model_api_key_viewed', 'ai_model_connection_tested', 'admin_created', 'admin_role_assigned', 'admin_permissions_changed', 'role_created', 'role_updated', 'role_deleted')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum" USING "action"::"text"::"public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_targettype_enum" RENAME TO "audit_logs_targettype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_targettype_enum" AS ENUM('user', 'paper', 'report', 'payout', 'settings', 'ai_model', 'credit_package', 'role', 'permission', 'admin')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "targetType" TYPE "public"."audit_logs_targettype_enum" USING "targetType"::"text"::"public"."audit_logs_targettype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_targettype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "system_settings" ALTER COLUMN "platform_name" SET DEFAULT 'Edu AI Platform'`);
        await queryRunner.query(`ALTER TABLE "system_settings" ALTER COLUMN "support_email" SET DEFAULT 'support@eduai.com'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
        await queryRunner.query(`ALTER TABLE "system_settings" ADD CONSTRAINT "FK_e88330d1174f4fcec47785f53ba" FOREIGN KEY ("default_ai_model_id") REFERENCES "ai_model_configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_settings" DROP CONSTRAINT "FK_e88330d1174f4fcec47785f53ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`ALTER TABLE "system_settings" ALTER COLUMN "support_email" SET DEFAULT 'support@teachersmarketplace.com'`);
        await queryRunner.query(`ALTER TABLE "system_settings" ALTER COLUMN "platform_name" SET DEFAULT 'Teachers Marketplace'`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_targettype_enum_old" AS ENUM('user', 'paper', 'report', 'payout', 'settings', 'credit_package', 'role', 'permission', 'admin')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "targetType" TYPE "public"."audit_logs_targettype_enum_old" USING "targetType"::"text"::"public"."audit_logs_targettype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_targettype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_targettype_enum_old" RENAME TO "audit_logs_targettype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum_old" AS ENUM('user_suspended', 'user_reactivated', 'user_created', 'user_updated', 'user_deleted', 'user_role_changed', 'paper_approved', 'paper_rejected', 'paper_suspended', 'paper_taken_down', 'paper_reactivated', 'payout_approved', 'payout_rejected', 'payout_processed', 'report_resolved', 'report_dismissed', 'settings_updated', 'credit_package_created', 'credit_package_updated', 'credit_package_deleted', 'admin_created', 'admin_role_assigned', 'admin_permissions_changed', 'role_created', 'role_updated', 'role_deleted')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum_old" USING "action"::"text"::"public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum_old" RENAME TO "audit_logs_action_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum_old" AS ENUM('create', 'read', 'update', 'delete', 'suspend', 'export')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "action" TYPE "public"."permissions_action_enum_old" USING "action"::"text"::"public"."permissions_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_action_enum_old" RENAME TO "permissions_action_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum_old" AS ENUM('users', 'settings', 'reports')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum_old" USING "resource"::"text"::"public"."permissions_resource_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum_old" RENAME TO "permissions_resource_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "default_ai_model_id"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "allowed_file_types"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "max_file_upload_size"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "social_instagram"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "social_linkedin"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "social_twitter"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "social_facebook"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "contact_address"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "app_favicon"`);
        await queryRunner.query(`ALTER TABLE "system_settings" DROP COLUMN "app_logo"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f031aa06c5e9557a8ce1fd591"`);
        await queryRunner.query(`DROP TABLE "ai_model_configurations"`);
        await queryRunner.query(`DROP TYPE "public"."ai_model_configurations_provider_enum"`);
    }

}
