import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { EncryptionService } from '@/common/services/encryption.service';
import { SystemSetting } from './entities/system-setting.entity';
import { AiModelConfiguration } from './entities/ai-model-configuration.entity';
import { SystemSettingsRepository } from './system-settings.repository';
import { AiModelConfigurationRepository } from './ai-model-configuration.repository';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AiModelConfigurationService } from './ai-model-configuration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting, AiModelConfiguration]),
    AuditModule,
    UsersModule,
  ],
  controllers: [SettingsController],
  providers: [
    EncryptionService,
    SystemSettingsRepository,
    AiModelConfigurationRepository,
    SettingsService,
    AiModelConfigurationService,
  ],
  exports: [SettingsService, AiModelConfigurationService],
})
export class SettingsModule {}
