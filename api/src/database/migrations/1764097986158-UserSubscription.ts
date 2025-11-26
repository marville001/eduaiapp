import { MigrationInterface, QueryRunner } from "typeorm";

export class UserSubscription1764097986158 implements MigrationInterface {
    name = 'UserSubscription1764097986158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_subscriptions_status_enum" AS ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused')`);
        await queryRunner.query(`CREATE TYPE "public"."user_subscriptions_payment_status_enum" AS ENUM('succeeded', 'pending', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "user_subscriptions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer NOT NULL, "package_id" integer, "stripe_customer_id" character varying(255), "stripe_subscription_id" character varying(255), "stripe_price_id" character varying(255), "status" "public"."user_subscriptions_status_enum" NOT NULL DEFAULT 'incomplete', "payment_status" "public"."user_subscriptions_payment_status_enum", "currency" character varying(3) NOT NULL DEFAULT 'usd', "amount" numeric(10,2), "current_period_start" TIMESTAMP, "current_period_end" TIMESTAMP, "trial_start" TIMESTAMP, "trial_end" TIMESTAMP, "canceled_at" TIMESTAMP, "ended_at" TIMESTAMP, "cancel_at_period_end" boolean NOT NULL DEFAULT false, "cancellation_reason" text, "questions_used" integer NOT NULL DEFAULT '0', "chats_used" integer NOT NULL DEFAULT '0', "file_uploads_used" integer NOT NULL DEFAULT '0', "usage_reset_at" TIMESTAMP, "metadata" text, CONSTRAINT "UQ_fa0893fd6af691f2085ff7fdfc8" UNIQUE ("stripe_subscription_id"), CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9e928b0954e51705ab44988812" ON "user_subscriptions" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_0641da02314913e28f6131310eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_ec9362dd8ff98a317e9c66bcd6f" FOREIGN KEY ("package_id") REFERENCES "subscription_packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_ec9362dd8ff98a317e9c66bcd6f"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_0641da02314913e28f6131310eb"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e928b0954e51705ab44988812"`);
        await queryRunner.query(`DROP TABLE "user_subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."user_subscriptions_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_subscriptions_status_enum"`);
    }

}
