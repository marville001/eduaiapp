import { EncryptionService } from '@/common/services/encryption.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { AiModelConfigurationRepository } from './ai-model-configuration.repository';
import { AiModelConfigurationService } from './ai-model-configuration.service';
import { AiModelConfiguration } from './entities/ai-model-configuration.entity';
import { StripeSetting } from './entities/stripe-setting.entity';
import { SubscriptionPackage } from './entities/subscription-package.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { StripeSettingsRepository } from './stripe-settings.repository';
import { StripeSettingsService } from './stripe-settings.service';
import { SubscriptionPackageRepository } from './subscription-package.repository';
import { SubscriptionPackageService } from './subscription-package.service';
import { SystemSettingsRepository } from './system-settings.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemSetting,
      AiModelConfiguration,
      StripeSetting,
      SubscriptionPackage,
    ]),
    AuditModule,
    UsersModule,
  ],
  controllers: [SettingsController],
  providers: [
    EncryptionService,
    SystemSettingsRepository,
    AiModelConfigurationRepository,
    StripeSettingsRepository,
    SubscriptionPackageRepository,
    SettingsService,
    AiModelConfigurationService,
    StripeSettingsService,
    SubscriptionPackageService,
  ],
  exports: [
    SettingsService,
    AiModelConfigurationService,
    StripeSettingsService,
    SubscriptionPackageService,
  ],
})
export class SettingsModule { }
