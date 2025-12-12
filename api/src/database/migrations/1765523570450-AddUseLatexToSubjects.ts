import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUseLatexToSubjects1765523570450 implements MigrationInterface {
    name = 'AddUseLatexToSubjects1765523570450';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" ADD "use_latex" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "use_latex"`);
    }

}
