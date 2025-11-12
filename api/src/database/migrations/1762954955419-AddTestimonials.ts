import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestimonials1762954955419 implements MigrationInterface {
    name = 'AddTestimonials1762954955419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "testimonials" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "testimonial_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerName" character varying(255) NOT NULL, "customerTitle" character varying(255), "customerCompany" character varying(255), "customerImage" character varying(500), "content" text NOT NULL, "rating" integer NOT NULL DEFAULT '5', "isActive" boolean NOT NULL DEFAULT true, "isFeatured" boolean NOT NULL DEFAULT false, "sortOrder" integer NOT NULL DEFAULT '0', "category" character varying(50) NOT NULL DEFAULT 'general', "testimonialDate" date, "videoUrl" text, "sourceUrl" character varying(500), CONSTRAINT "PK_0c7965806b5a784135791c0eb7d" PRIMARY KEY ("id", "testimonial_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_63b03c608bd258f115a0a4a106" ON "testimonials" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_63b03c608bd258f115a0a4a106"`);
        await queryRunner.query(`DROP TABLE "testimonials"`);
    }

}
