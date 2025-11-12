import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFAQs1762959845206 implements MigrationInterface {
    name = 'AddFAQs1762959845206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "faqs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "question" character varying(500) NOT NULL, "answer" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2ddf4f2c910f8e8fa2663a67bf" ON "faqs" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ddf4f2c910f8e8fa2663a67bf"`);
        await queryRunner.query(`DROP TABLE "faqs"`);
    }

}
