import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
		StorageModule
	],
	controllers: [AiController],
	providers: [AiService, AiRepository],
	exports: [AiService, AiRepository],
})
export class AiModule { }