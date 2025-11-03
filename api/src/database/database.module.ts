import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Role } from '@/modules/permissions/entities/role.entity';
import { SystemSetting } from '@/modules/settings/entities/system-setting.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.getOrThrow('DATABASE_HOST'),
				port: configService.getOrThrow('DATABASE_PORT'),
				database: configService.getOrThrow('DATABASE_NAME'),
				username: configService.getOrThrow('DATABASE_USERNAME'),
				password: configService.getOrThrow('DATABASE_PASSWORD'),
				entities: [
					User,
					Role,
					Permission,
					SystemSetting,
					AuditLog,
					Subject,
				],
				migrationsTableName: 'migrations',
				migrationsRun: true,
				logging: false, // process.env.ENV !== 'production',
				ssl: process.env.NODE_ENV === 'production',
				extra: {
					connectionLimit: 10,
					...(process.env.NODE_ENV === 'production' ? {
						ssl: {
							rejectUnauthorized: false
						}
					} : {})
				},
			}),
			inject: [ConfigService],
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseModule { }