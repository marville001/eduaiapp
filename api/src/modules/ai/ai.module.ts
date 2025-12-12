import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingModule } from '../billing/billing.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { SettingsModule } from '../settings/settings.module';
import { StorageModule } from '../storage/storage.module';
import { SubjectModule } from '../subjects/subject.module';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';
import { ChatMessage } from './entities/chat-message.entity';
import { Question } from './entities/question.entity';
import { OpenAiModule } from './openai/openai.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Question, ChatMessage]),
		forwardRef(() => SettingsModule),
		forwardRef(() => SubjectModule),
		forwardRef(() => OpenAiModule),
		forwardRef(() => PermissionsModule),
		forwardRef(() => BillingModule),
		StorageModule
	],
	controllers: [AiController],
	providers: [AiService, AiRepository],
	exports: [AiService, AiRepository],
})
export class AiModule { }