import { DocumentMeta } from '@/common/class/document-meta';
import { FileValidationPipe } from '@/common/pipes/file-validation.pipe';
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Request,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { S3Service } from '../storage/s3.service';
import { AiService } from './ai.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@ApiTags('AI Chat')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
	constructor(
		private readonly aiService: AiService,
		private readonly s3Service: S3Service,
		private readonly configService: ConfigService,
	) { }

	@Post('ask')
	@ApiOperation({ summary: 'Ask a question to AI' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Question submitted successfully' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid question data' })
	@UseInterceptors(FilesInterceptor('files'))
	async askQuestion(
		@Body() askQuestionDto: AskQuestionDto,
		@UploadedFiles(FileValidationPipe) files: Array<Express.Multer.File>
	) {
		let attachedDocuments: DocumentMeta[] = [];
		try {
			if (files && files.length > 0) {
				const uploadedFiles = await this.s3Service.uploadFiles(files, 'ai-questions');
				attachedDocuments = files.map((file, index) => ({
					name: file.originalname,
					fileType: file.mimetype,
					size: file.size,
					mimeType: file.mimetype,
					uploadedAt: new Date().toISOString(),
					accessKey: uploadedFiles[index].key,
					url: uploadedFiles[index].url,
				}));
			}
		} catch (error) {
			throw new BadRequestException('Failed to process attached documents');
		}

		return await this.aiService.askQuestion(askQuestionDto, attachedDocuments);
	}

	@Get('question/:questionId')
	@ApiOperation({ summary: 'Get question details' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Question details retrieved' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Question not found' })
	async getQuestion(
		@Param('questionId', ParseUUIDPipe) questionId: string,
		@Request() req: any,
	) {
		return await this.aiService.getQuestion(questionId, req.user.id);
	}

	@Get('question/:questionId/chat')
	@ApiOperation({ summary: 'Get question with chat messages' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Question with chat history retrieved' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Question not found' })
	async getQuestionWithMessages(
		@Param('questionId', ParseUUIDPipe) questionId: string) {
		return await this.aiService.getQuestionWithMessages(questionId);
	}

	@Post('question/:questionId/chat')
	@ApiOperation({ summary: 'Send a chat message' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Message sent successfully' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Question not found' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot chat on unanswered question' })
	async sendChatMessage(
		@Param('questionId', ParseUUIDPipe) questionId: string,
		@Body() sendChatMessageDto: SendChatMessageDto,
	) {
		return await this.aiService.sendChatMessage(questionId, sendChatMessageDto);
	}

	@Get('questions')
	@ApiOperation({ summary: 'Get user questions' })
	@ApiResponse({ status: HttpStatus.OK, description: 'User questions retrieved' })
	async getUserQuestions(@Request() req: any) {
		return await this.aiService.getUserQuestions(req.user.id);
	}

	@Get('question/:questionId/messages')
	@ApiOperation({ summary: 'Get chat history for a question' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Chat history retrieved' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Question not found' })
	async getChatHistory(
		@Param('questionId', ParseUUIDPipe) questionId: string,
		@Request() req: any,
	) {
		return await this.aiService.getChatHistory(questionId, req.user.id);
	}

	@Get('stats')
	@ApiOperation({ summary: 'Get question statistics' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved' })
	async getQuestionStats(@Request() req: any) {
		return await this.aiService.getQuestionStats(req.user.id);
	}
}