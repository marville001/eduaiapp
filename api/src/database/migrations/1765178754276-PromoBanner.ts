import { MigrationInterface, QueryRunner } from "typeorm";

export class PromoBanner1765178754276 implements MigrationInterface {
    name = 'PromoBanner1765178754276'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "promo_banners" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying(255) NOT NULL, "description" text, "imageUrl" character varying(500), "buttonText" character varying(100) NOT NULL, "buttonUrl" character varying(500) NOT NULL, "buttonVariant" character varying(50) NOT NULL DEFAULT 'primary', "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "placement" character varying(50) NOT NULL DEFAULT 'ai-tutor', CONSTRAINT "PK_0d88a5f18687d8f32716f2a217f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0d88a5f18687d8f32716f2a217" ON "promo_banners" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d88a5f18687d8f32716f2a217"`);
        await queryRunner.query(`DROP TABLE "promo_banners"`);
    }

}
