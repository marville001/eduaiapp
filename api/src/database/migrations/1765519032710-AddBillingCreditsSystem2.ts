import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingCreditsSystem21765519032710 implements MigrationInterface {
    name = 'AddBillingCreditsSystem21765519032710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."credit_transactions_transaction_type_enum" AS ENUM('subscription_allocation', 'subscription_renewal', 'top_up_purchase', 'promotional', 'refund', 'admin_adjustment', 'signup_bonus', 'referral_bonus', 'ai_question', 'ai_chat_message', 'ai_document_analysis', 'ai_image_generation', 'ai_advanced_model', 'feature_usage', 'expiration', 'subscription_downgrade', 'subscription_cancellation')`);
        await queryRunner.query(`CREATE TYPE "public"."credit_transactions_status_enum" AS ENUM('pending', 'completed', 'failed', 'reversed')`);
        await queryRunner.query(`CREATE TABLE "credit_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer NOT NULL, "transaction_type" "public"."credit_transactions_transaction_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "balance_after" numeric(12,2) NOT NULL, "balance_before" numeric(12,2) NOT NULL, "status" "public"."credit_transactions_status_enum" NOT NULL DEFAULT 'completed', "description" character varying(500) NOT NULL, "reference_id" character varying(255), "reference_type" character varying(100), "ip_address" character varying(45), "user_agent" character varying(500), "metadata" text, "expires_at" TIMESTAMP, "original_transaction_id" integer, CONSTRAINT "PK_a408319811d1ab32832ec86fc2c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ce3520101105eaf8a69d93b889" ON "credit_transactions" ("reference_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7b4d8296ab49884c839db18ea" ON "credit_transactions" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_f4e9423e9f924bf2c315f2c54d" ON "credit_transactions" ("transaction_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_9ac41a5292ef4d8356a86be30c" ON "credit_transactions" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user_credits" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer NOT NULL, "available_credits" numeric(12,2) NOT NULL DEFAULT '0', "total_allocated" numeric(12,2) NOT NULL DEFAULT '0', "total_consumed" numeric(12,2) NOT NULL DEFAULT '0', "expiring_credits" numeric(12,2) NOT NULL DEFAULT '0', "purchased_credits" numeric(12,2) NOT NULL DEFAULT '0', "credits_expire_at" TIMESTAMP, "last_reset_at" TIMESTAMP, "low_credit_threshold" integer NOT NULL DEFAULT '100', "low_credit_notified" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_e517bd2a3be00563896952bcd3" UNIQUE ("user_id"), CONSTRAINT "PK_02811227c8934f2daee2b018bb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e517bd2a3be00563896952bcd3" ON "user_credits" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" ADD CONSTRAINT "FK_9ac41a5292ef4d8356a86be30c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_credits" ADD CONSTRAINT "FK_e517bd2a3be00563896952bcd38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credits" DROP CONSTRAINT "FK_e517bd2a3be00563896952bcd38"`);
        await queryRunner.query(`ALTER TABLE "credit_transactions" DROP CONSTRAINT "FK_9ac41a5292ef4d8356a86be30c2"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e517bd2a3be00563896952bcd3"`);
        await queryRunner.query(`DROP TABLE "user_credits"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ac41a5292ef4d8356a86be30c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4e9423e9f924bf2c315f2c54d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7b4d8296ab49884c839db18ea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce3520101105eaf8a69d93b889"`);
        await queryRunner.query(`DROP TABLE "credit_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."credit_transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."credit_transactions_transaction_type_enum"`);
    }

}
