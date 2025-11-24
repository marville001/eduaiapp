import { DocumentMeta } from '@/common/class/document-meta';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permission, RequirePermissions } from '@/common/decorators/permissions.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { FileValidationPipe } from '@/common/pipes/file-validation.pipe';
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Post,
	Query,
	Request,
	UploadedFiles,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PermissionAction, PermissionResource } from '../permissions/entities/permission.entity';
import { S3Service } from '../storage/s3.service';
import { AiService } from './ai.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { QuestionStatus } from './entities/question.entity';

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
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user questions' })
	@ApiResponse({ status: HttpStatus.OK, description: 'User questions retrieved' })
	async getUserQuestions(
		@CurrentUser() user: JwtPayload,
	) {
		return await this.aiService.getUserQuestions(user.sub);
	}

	@Get('question/:questionId/messages')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get chat history for a question' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Chat history retrieved' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Question not found' })
	async getChatHistory(
		@Param('questionId', ParseUUIDPipe) questionId: string,
		@CurrentUser() user: JwtPayload,
	) {
		return await this.aiService.getChatHistory(questionId, user.sub);
	}

	@Get('stats')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get question statistics' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved' })
	async getQuestionStats(@CurrentUser() user: JwtPayload,) {
		return await this.aiService.getQuestionStats(user.sub);
	}

	// Admin Endpoints
	@Get('admin/questions')
	@ApiTags('AI Admin')
	@ApiSecurity('bearer')
	@ApiBearerAuth('JWT')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@RequirePermissions(Permission(PermissionResource.QUESTIONS, PermissionAction.READ))
	@ApiOperation({ summary: 'Get all questions (Admin only)' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
	@ApiQuery({ name: 'status', required: false, enum: QuestionStatus, description: 'Filter by status' })
	@ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filter by user ID' })
	@ApiQuery({ name: 'subjectId', required: false, type: Number, description: 'Filter by subject ID' })
	@ApiQuery({ name: 'search', required: false, type: String, description: 'Search in question text, user email, or subject name' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Questions retrieved successfully' })
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - insufficient permissions' })
	async getAllQuestions(
		@Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
		@Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
		@Query('status') status?: QuestionStatus,
		@Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
		@Query('subjectId', new ParseIntPipe({ optional: true })) subjectId?: number,
		@Query('search') search?: string,
	) {
		return await this.aiService.getAllQuestions({
			page,
			limit,
			status,
			userId,
			subjectId,
			search,
		});
	}

	@Get('admin/question/:questionId')
	@ApiTags('AI Admin')
	@ApiSecurity('bearer')
	@ApiBearerAuth('JWT')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@RequirePermissions(Permission(PermissionResource.QUESTIONS, PermissionAction.READ))
	@ApiOperation({ summary: 'Get question details with full data (Admin only)' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Question details retrieved' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Question not found' })
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - insufficient permissions' })
	async getQuestionForAdmin(
		@Param('questionId', ParseUUIDPipe) questionId: string,
	) {
		return await this.aiService.getQuestionForAdmin(questionId);
	}
}