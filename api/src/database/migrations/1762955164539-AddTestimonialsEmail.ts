import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestimonialsEmail1762955164539 implements MigrationInterface {
    name = 'AddTestimonialsEmail1762955164539';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testimonials" ADD "customerEmail" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testimonials" DROP COLUMN "customerEmail"`);
    }

}
