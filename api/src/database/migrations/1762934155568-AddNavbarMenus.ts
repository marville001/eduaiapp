import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNavbarMenus1762934155568 implements MigrationInterface {
    name = 'AddNavbarMenus1762934155568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "navbar_menus" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "menu_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "url" character varying(500), "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "parentId" integer, "target" character varying(50) NOT NULL DEFAULT '_self', "icon" character varying(100), "description" text, CONSTRAINT "UQ_c8fec9d9260e8ae5cefb9101db4" UNIQUE ("slug"), CONSTRAINT "PK_ddbb68bd3e15d4294b8446c1da7" PRIMARY KEY ("id", "menu_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_900910ead7231fecc5af6e3a34" ON "navbar_menus" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "navbar_menus" ADD CONSTRAINT "FK_93d85d614f7c6121ba61d13c068" FOREIGN KEY ("parentId") REFERENCES "navbar_menus"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "navbar_menus" DROP CONSTRAINT "FK_93d85d614f7c6121ba61d13c068"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_900910ead7231fecc5af6e3a34"`);
        await queryRunner.query(`DROP TABLE "navbar_menus"`);
    }

}
