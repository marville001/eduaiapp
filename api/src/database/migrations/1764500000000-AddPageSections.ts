import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPageSections1764500000000 implements MigrationInterface {
	name = 'AddPageSections1764500000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Add sections column as JSON to pages table
		await queryRunner.query(`ALTER TABLE "pages" ADD "sections" json`);
		// Make content nullable since sections can replace it
		await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "content" DROP NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "sections"`);
		await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "content" SET NOT NULL`);
	}
}
