import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCanonicalUrlToSEOFields1764226770479 implements MigrationInterface {
    name = 'AddCanonicalUrlToSEOFields1764226770479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" ADD "canonicalUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "canonicalUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "pages" ADD "canonicalUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "canonicalUrl"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "canonicalUrl"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "canonicalUrl"`);
    }

}
