import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSEOFieldsToSubjects1762168507862 implements MigrationInterface {
    name = 'AddSEOFieldsToSubjects1762168507862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" ADD "aiPrompt" text`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "seoTitle" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "seoDescription" text`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "seoTags" text`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "seoImage" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "seoImage"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "seoTags"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "seoDescription"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "seoTitle"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "aiPrompt"`);
    }

}
