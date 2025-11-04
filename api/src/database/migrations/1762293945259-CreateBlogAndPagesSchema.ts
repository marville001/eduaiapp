import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlogAndPagesSchema1762293945259 implements MigrationInterface {
    name = 'CreateBlogAndPagesSchema1762293945259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."blogs_status_enum" AS ENUM('draft', 'published', 'scheduled', 'archived')`);
        await queryRunner.query(`CREATE TABLE "blogs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "blog_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "excerpt" text, "content" text NOT NULL, "featuredImage" character varying(500), "status" "public"."blogs_status_enum" NOT NULL DEFAULT 'draft', "isActive" boolean NOT NULL DEFAULT true, "publishedAt" TIMESTAMP, "scheduledAt" TIMESTAMP, "category_id" integer, "views" integer NOT NULL DEFAULT '0', "likes" integer NOT NULL DEFAULT '0', "readingTime" integer NOT NULL DEFAULT '0', "seoTitle" character varying(255), "seoDescription" text, "seoTags" text, "seoImage" character varying(500), CONSTRAINT "UQ_7b18faaddd461656ff66f32e2d7" UNIQUE ("slug"), CONSTRAINT "PK_6d1395e120f8ce4ed23ba88119b" PRIMARY KEY ("id", "blog_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e113335f11c926da929a625f11" ON "blogs" ("id") `);
        await queryRunner.query(`CREATE TABLE "blog_categories" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "category_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "color" character varying(7), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_903a6ea496e83ba9bec10af5835" UNIQUE ("slug"), CONSTRAINT "PK_d4fe03f9ba436d9810bc9ae3774" PRIMARY KEY ("id", "category_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1056d6faca26b9957f5d26e657" ON "blog_categories" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."pages_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "pages" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "page_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "excerpt" text, "content" text NOT NULL, "featuredImage" character varying(500), "status" "public"."pages_status_enum" NOT NULL DEFAULT 'draft', "isActive" boolean NOT NULL DEFAULT true, "publishedAt" TIMESTAMP, "views" integer NOT NULL DEFAULT '0', "readingTime" integer NOT NULL DEFAULT '0', "seoTitle" character varying(255), "seoDescription" text, "seoTags" text, "seoImage" character varying(500), CONSTRAINT "UQ_fe66ca6a86dc94233e5d7789535" UNIQUE ("slug"), CONSTRAINT "PK_3b35e472b58135753d0487c69da" PRIMARY KEY ("id", "page_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8f21ed625aa34c8391d636b7d3" ON "pages" ("id") `);
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "FK_1f073a9f9720fe731423f1064cc" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "FK_1f073a9f9720fe731423f1064cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f21ed625aa34c8391d636b7d3"`);
        await queryRunner.query(`DROP TABLE "pages"`);
        await queryRunner.query(`DROP TYPE "public"."pages_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1056d6faca26b9957f5d26e657"`);
        await queryRunner.query(`DROP TABLE "blog_categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e113335f11c926da929a625f11"`);
        await queryRunner.query(`DROP TABLE "blogs"`);
        await queryRunner.query(`DROP TYPE "public"."blogs_status_enum"`);
    }

}
