import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFooterMenus1762944224032 implements MigrationInterface {
    name = 'AddFooterMenus1762944224032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "footer_items" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "item_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "url" character varying(500), "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "target" character varying(50) NOT NULL DEFAULT '_self', "icon" character varying(100), "description" text, "columnId" integer NOT NULL, CONSTRAINT "PK_4fc11c4c47e0530107eca56a16a" PRIMARY KEY ("id", "item_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_849ab1bc4d87d58dd212dba2ef" ON "footer_items" ("id") `);
        await queryRunner.query(`CREATE TABLE "footer_columns" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "column_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "description" text, CONSTRAINT "UQ_388e97ed3104f135486c015659b" UNIQUE ("slug"), CONSTRAINT "PK_cd94e2bf1460002abbf1207727a" PRIMARY KEY ("id", "column_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cb728dba9d195dbab162cde8b2" ON "footer_columns" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "footer_items" ADD CONSTRAINT "FK_ad8c5bb11a792a37367455391ad" FOREIGN KEY ("columnId") REFERENCES "footer_columns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "footer_items" DROP CONSTRAINT "FK_ad8c5bb11a792a37367455391ad"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb728dba9d195dbab162cde8b2"`);
        await queryRunner.query(`DROP TABLE "footer_columns"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_849ab1bc4d87d58dd212dba2ef"`);
        await queryRunner.query(`DROP TABLE "footer_items"`);
    }

}
