import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAiChatTables1762635461580 implements MigrationInterface {
    name = 'CreateAiChatTables1762635461580';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."questions_status_enum" AS ENUM('pending', 'answered', 'failed')`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "question_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_id" integer NOT NULL, "user_id" integer, "ai_model_id" integer NOT NULL, "question" text NOT NULL, "answer" text, "status" "public"."questions_status_enum" NOT NULL DEFAULT 'pending', "processing_time_ms" integer, "token_usage" integer, "file_attachments" json, "error_message" text, CONSTRAINT "PK_22af903ba6ba94e4071ae0edd47" PRIMARY KEY ("id", "question_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_08a6d4b0f49ff300bf3a0ca60a" ON "questions" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."chat_messages_role_enum" AS ENUM('user', 'assistant', 'system')`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "message_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" integer NOT NULL, "user_id" integer, "role" "public"."chat_messages_role_enum" NOT NULL, "content" text NOT NULL, "ai_model_id" integer, "token_usage" integer, "processing_time_ms" integer, "metadata" json, CONSTRAINT "PK_b2d8095b5385f0f9857b9e9f16a" PRIMARY KEY ("id", "message_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_40c55ee0e571e268b0d3cd37d1" ON "chat_messages" ("id") `);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_5800cd25a5888174b2c40e67d4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_bab312bafb550a655ece4bca116" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_94092dee322d16e92baf2094c1f" FOREIGN KEY ("ai_model_id") REFERENCES "ai_model_configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_06eab8fc7b840a91820db95d5d4" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_a0a0cb3e22bbfb223488117b7e5" FOREIGN KEY ("ai_model_id") REFERENCES "ai_model_configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_5588b6cea298cedec7063c0d33e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_5588b6cea298cedec7063c0d33e"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_a0a0cb3e22bbfb223488117b7e5"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_06eab8fc7b840a91820db95d5d4"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_94092dee322d16e92baf2094c1f"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_bab312bafb550a655ece4bca116"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_5800cd25a5888174b2c40e67d4b"`);
        await queryRunner.query(`ALTER TABLE "ai_model_configurations" ALTER COLUMN "temperature" SET DEFAULT 0.7`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40c55ee0e571e268b0d3cd37d1"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TYPE "public"."chat_messages_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08a6d4b0f49ff300bf3a0ca60a"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TYPE "public"."questions_status_enum"`);
    }

}
