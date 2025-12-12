import { ChatMessage } from '@/modules/ai/entities/chat-message.entity';
import { Question } from '@/modules/ai/entities/question.entity';
import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { CreditTransaction, UserCredits } from '@/modules/billing';
import { BlogCategory } from '@/modules/blogs/entities/blog-category.entity';
import { Blog } from '@/modules/blogs/entities/blog.entity';
import { Faq } from '@/modules/faqs/entities/faq.entity';
import { FooterColumn } from '@/modules/footer-menus/entities/footer-column.entity';
import { FooterItem } from '@/modules/footer-menus/entities/footer-item.entity';
import { NavbarMenu } from '@/modules/navbar-menus/entities/navbar-menu.entity';
import { Page } from '@/modules/pages/entities/page.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Role } from '@/modules/permissions/entities/role.entity';
import { PromoBanner } from '@/modules/promo-banners/entities/promo-banner.entity';
import { AiModelConfiguration } from '@/modules/settings/entities/ai-model-configuration.entity';
import { StripeSetting } from '@/modules/settings/entities/stripe-setting.entity';
import { SubscriptionPackage } from '@/modules/settings/entities/subscription-package.entity';
import { SystemSetting } from '@/modules/settings/entities/system-setting.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { UserSubscription } from '@/modules/subscriptions/entities/user-subscription.entity';
import { Testimonial } from '@/modules/testimonials/entities/testimonial.entity';
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
  ChatMessage,
  NavbarMenu,
  FooterColumn,
  FooterItem,
  Testimonial,
  Faq,
  StripeSetting,
  SubscriptionPackage,
  UserSubscription,
  PromoBanner,
  CreditTransaction,
  UserCredits
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
  logging: false,
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