import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from '../settings/settings.module';
import { SubjectModule } from '../subjects/subject.module';
import { AiController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';
import { ChatMessage } from './entities/chat-message.entity';
import { Question } from './entities/question.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Question, ChatMessage]),
		SettingsModule,
		forwardRef(() => SubjectModule)
	],
	controllers: [AiController],
	providers: [AiService, AiRepository],
	exports: [AiService, AiRepository],
})
export class AiModule { }