import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeSettingsAndSubscriptionPackages1763542313855 implements MigrationInterface {
    name = 'AddStripeSettingsAndSubscriptionPackages1763542313855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stripe_settings" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "is_enabled" boolean NOT NULL DEFAULT false, "publishable_key" character varying(500), "secret_key_encrypted" text, "webhook_secret_encrypted" text, "allow_subscriptions" boolean NOT NULL DEFAULT true, "trial_period_days" integer NOT NULL DEFAULT '0', "allow_cancellation" boolean NOT NULL DEFAULT true, "prorate_charges" boolean NOT NULL DEFAULT true, "currency" character varying(3) NOT NULL DEFAULT 'usd', "payment_methods" text NOT NULL DEFAULT 'card', "collect_tax" boolean NOT NULL DEFAULT false, "tax_rate_percentage" numeric(5,2) DEFAULT '0', "last_connection_test_at" TIMESTAMP, "last_connection_successful" boolean, "last_connection_error" text, CONSTRAINT "PK_4413ab5408e655098949e2b8d85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4413ab5408e655098949e2b8d8" ON "stripe_settings" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."subscription_packages_package_type_enum" AS ENUM('free', 'basic', 'premium', 'enterprise', 'custom')`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_packages_billing_interval_enum" AS ENUM('day', 'week', 'month', 'year')`);
        await queryRunner.query(`CREATE TABLE "subscription_packages" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "description" text, "package_type" "public"."subscription_packages_package_type_enum" NOT NULL DEFAULT 'custom', "price" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'usd', "billing_interval" "public"."subscription_packages_billing_interval_enum" NOT NULL DEFAULT 'month', "interval_count" integer NOT NULL DEFAULT '1', "stripe_product_id" character varying(255), "stripe_price_id" character varying(255), "features" text, "max_questions_per_month" integer, "max_chats_per_month" integer, "max_file_uploads" integer, "ai_models_access" text, "priority_support" boolean NOT NULL DEFAULT false, "custom_branding" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "is_visible" boolean NOT NULL DEFAULT true, "is_featured" boolean NOT NULL DEFAULT false, "is_popular" boolean NOT NULL DEFAULT false, "trial_period_days" integer NOT NULL DEFAULT '0', "display_order" integer NOT NULL DEFAULT '0', "badge_text" character varying(50), "badge_color" character varying(50), "button_text" character varying(50) NOT NULL DEFAULT 'Subscribe', "metadata" text, CONSTRAINT "UQ_24c308216b8633be0aeee7fffb6" UNIQUE ("stripe_price_id"), CONSTRAINT "PK_1f6f3a0eb04062c80a9acf24a8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1f6f3a0eb04062c80a9acf24a8" ON "subscription_packages" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f6f3a0eb04062c80a9acf24a8"`);
        await queryRunner.query(`DROP TABLE "subscription_packages"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_packages_billing_interval_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_packages_package_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4413ab5408e655098949e2b8d8"`);
        await queryRunner.query(`DROP TABLE "stripe_settings"`);
    }

}
