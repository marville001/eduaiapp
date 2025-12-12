import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameMonthlyCreditsToCreditsAllocation1765481363553 implements MigrationInterface {
    name = 'RenameMonthlyCreditsToCreditsAllocation1765481363553';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_packages" RENAME COLUMN "monthly_credits" TO "credits_allocation"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_packages" RENAME COLUMN "credits_allocation" TO "monthly_credits"`);
    }

}
