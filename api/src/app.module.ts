import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './modules/ai/ai.module';
import { OpenAiModule } from './modules/ai/openai/openai.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blogs/blog.module';
import { FooterMenuModule } from './modules/footer-menus/footer-menu.module';
import { LoggingModule } from './modules/logging/logging.module';
import { MailModule } from './modules/mail/mail.module';
import { NavbarMenuModule } from './modules/navbar-menus/navbar-menu.module';
import { PageModule } from './modules/pages/page.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StorageModule } from './modules/storage/storage.module';
import { SubjectModule } from './modules/subjects/subject.module';
import { UsersModule } from './modules/users/users.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				PORT: Joi.number().required(),
				API_PREFIX: Joi.string(),

				DATABASE_HOST: Joi.string().required(),
				DATABASE_PORT: Joi.number().required(),
				DATABASE_USERNAME: Joi.string().required(),
				DATABASE_PASSWORD: Joi.string().required(),
				DATABASE_NAME: Joi.string().required(),

				ENCRYPTION_KEY: Joi.string().required(),

				JWT_SECRET: Joi.string().required(),

				JWT_EXPIRES_IN: Joi.string().required(),
				JWT_REFRESH_SECRET: Joi.string().required(),
				JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

				AWS_ACCESS_KEY_ID: Joi.string().required(),
				AWS_SECRET_ACCESS_KEY: Joi.string().required(),
				AWS_REGION: Joi.string().required(),
				AWS_S3_BUCKET: Joi.string().required(),

				MAIL_HOST: Joi.string().required(),
				MAIL_PORT: Joi.number().required(),
				MAIL_USER: Joi.string().required(),
				MAIL_PASSWORD: Joi.string().required(),
				MAIL_FROM: Joi.string().optional(),

				FRONTEND_URL: Joi.string().required(),
				BACKEND_URL: Joi.string().required(),

				THROTTLE_TTL: Joi.number().required(),
				THROTTLE_LIMIT: Joi.number().required(),

			})
		}),

		// Rate limiting
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				ttl: parseInt(configService.get('THROTTLE_TTL', '60000'), 10),
				limit: parseInt(configService.get('THROTTLE_LIMIT', '100'), 10),
			}),
			inject: [ConfigService],
		}),

		UsersModule,
		PermissionsModule,
		DatabaseModule,
		LoggingModule,
		MailModule,
		AuditModule,
		StorageModule,
		AuthModule,
		SettingsModule,
		SubjectModule,
		BlogModule,
		PageModule,
		NavbarMenuModule,
		FooterMenuModule,
		AiModule,
		OpenAiModule
	],
	providers: [
		// Global guards
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		// Global filters
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		// Global interceptors
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
})
export class AppModule { }