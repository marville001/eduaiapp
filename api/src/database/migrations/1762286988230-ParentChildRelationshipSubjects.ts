import { MigrationInterface, QueryRunner } from "typeorm";

export class ParentChildRelationshipSubjects1762286988230 implements MigrationInterface {
    name = 'ParentChildRelationshipSubjects1762286988230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "parentSubjectId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" ADD "parentSubjectId" integer`);
    }

}
