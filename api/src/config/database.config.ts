import { ChatMessage } from '@/modules/ai/entities/chat-message.entity';
import { Question } from '@/modules/ai/entities/question.entity';
import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { BlogCategory } from '@/modules/blogs/entities/blog-category.entity';
import { Blog } from '@/modules/blogs/entities/blog.entity';
import { Page } from '@/modules/pages/entities/page.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Role } from '@/modules/permissions/entities/role.entity';
import { AiModelConfiguration } from '@/modules/settings/entities/ai-model-configuration.entity';
import { SystemSetting } from '@/modules/settings/entities/system-setting.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export const entities = [
  User,
  Role,
  Permission,
  SystemSetting,
  AuditLog,
  Subject,
  Blog,
  BlogCategory,
  Page,
  AiModelConfiguration,
  Question,
  ChatMessage
];

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('DATABASE_HOST'),
  port: configService.getOrThrow('DATABASE_PORT'),
  database: configService.getOrThrow('DATABASE_NAME'),
  username: configService.getOrThrow('DATABASE_USERNAME'),
  password: configService.getOrThrow('DATABASE_PASSWORD'),
  migrations: ['src/database/migrations/**'],
  synchronize: false,
  logging: false, // process.env.ENV !== 'production',
  migrationsRun: true,
  ssl: process.env.NODE_ENV === 'production',
  extra: {
    connectionLimit: 10,
    ...(process.env.NODE_ENV === 'production' ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {})
  },
  entities,
});