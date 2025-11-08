import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Request
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@ApiTags('AI Chat')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
	constructor(private readonly aiService: AiService) { }

	@Post('ask')
	@ApiOperation({ summary: 'Ask a question to AI' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Question submitted successfully' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid question data' })
	async askQuestion(
		@Body() askQuestionDto: AskQuestionDto,
	) {
		return await this.aiService.askQuestion(askQuestionDto);
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
		@Request() req: any,
	) {
		return await this.aiService.sendChatMessage(
			questionId,
			sendChatMessageDto,
			req.user.id,
		);
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