import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1762106476131 implements MigrationInterface {
    name = 'InitialTables1762106476131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('users', 'settings', 'reports')`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum" AS ENUM('create', 'read', 'update', 'delete', 'suspend', 'export')`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "permissionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" "public"."permissions_resource_enum" NOT NULL, "action" "public"."permissions_action_enum" NOT NULL, "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_612b2c025539a6e4b5dd218114e" PRIMARY KEY ("id", "permissionId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_920331560282b8bd21bb02290d" ON "permissions" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7331684c0c5b063803a425001a" ON "permissions" ("resource", "action") `);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "roleId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "is_system_role" boolean NOT NULL DEFAULT false, "is_admin_role" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_84fe1ab57a2d8c0b55a4d2850ef" PRIMARY KEY ("id", "roleId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c1433d71a4838793a49dcad46a" ON "roles" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name") `);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" integer, "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "phone" character varying, "avatar_url" character varying, "role" character varying NOT NULL DEFAULT 'PARENT', "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "phone_verified" boolean NOT NULL DEFAULT false, "email_verified" boolean NOT NULL DEFAULT false, "is_admin_user" boolean NOT NULL DEFAULT false, "email_verification_token" character varying, "email_verification_expires" TIMESTAMP, "reset_password_token" character varying, "reset_password_expires" TIMESTAMP, "phone_verification_token" character varying, "phone_verification_expires" TIMESTAMP, "suspension_reason" text, "last_login_at" TIMESTAMP, "refresh_token" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_0ed310814bbf46ea421ba341901" PRIMARY KEY ("id", "user_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a3ffb1c0c8416b9fc6f907b743" ON "users" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('user_suspended', 'user_reactivated', 'user_created', 'user_updated', 'user_deleted', 'user_role_changed', 'paper_approved', 'paper_rejected', 'paper_suspended', 'paper_taken_down', 'paper_reactivated', 'payout_approved', 'payout_rejected', 'payout_processed', 'report_resolved', 'report_dismissed', 'settings_updated', 'credit_package_created', 'credit_package_updated', 'credit_package_deleted', 'admin_created', 'admin_role_assigned', 'admin_permissions_changed', 'role_created', 'role_updated', 'role_deleted')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_targettype_enum" AS ENUM('user', 'paper', 'report', 'payout', 'settings', 'credit_package', 'role', 'permission', 'admin')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "audit_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" "public"."audit_logs_action_enum" NOT NULL, "performed_by" integer NOT NULL, "performer_name" character varying, "targetType" "public"."audit_logs_targettype_enum" NOT NULL, "target_id" character varying, "details" text NOT NULL, "ip_address" character varying, "metadata" jsonb, CONSTRAINT "PK_df869ac49543a1da7738f07b35b" PRIMARY KEY ("id", "audit_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1bb179d048bbc581caa3b01343" ON "audit_logs" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON "audit_logs" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_430af08094aa1487c0a2a84026" ON "audit_logs" ("targetType") `);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_ae97aac6d6d471b9d88cea1c97" ON "audit_logs" ("performed_by") `);
        await queryRunner.query(`CREATE TABLE "system_settings" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "platform_name" character varying NOT NULL DEFAULT 'Teachers Marketplace', "support_email" character varying NOT NULL DEFAULT 'support@teachersmarketplace.com', "allow_signup" boolean NOT NULL DEFAULT false, "email_notifications" boolean NOT NULL DEFAULT true, "sms_notifications" boolean NOT NULL DEFAULT false, "admin_alerts" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_82521f08790d248b2a80cc85d4" ON "system_settings" ("id") `);
        await queryRunner.query(`CREATE TABLE "subjects" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subject_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "parentSubjectId" integer, "parent_subject_id" integer, CONSTRAINT "PK_dfd887b32fa05fa2a89703716c1" PRIMARY KEY ("id", "subject_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1a023685ac2b051b4e557b0b28" ON "subjects" ("id") `);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("role_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_ae97aac6d6d471b9d88cea1c971" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_7808ef83de078436223daaea162" FOREIGN KEY ("parent_subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_7808ef83de078436223daaea162"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_ae97aac6d6d471b9d88cea1c971"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a023685ac2b051b4e557b0b28"`);
        await queryRunner.query(`DROP TABLE "subjects"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_82521f08790d248b2a80cc85d4"`);
        await queryRunner.query(`DROP TABLE "system_settings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae97aac6d6d471b9d88cea1c97"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_430af08094aa1487c0a2a84026"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd10fda8276bb995288acfbfb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1bb179d048bbc581caa3b01343"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_targettype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3ffb1c0c8416b9fc6f907b743"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1433d71a4838793a49dcad46a"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7331684c0c5b063803a425001a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_920331560282b8bd21bb02290d"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
    }

}
