import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiModelConfigurationService } from '../settings/ai-model-configuration.service';
import { AiModelConfiguration, AiProvider } from '../settings/entities/ai-model-configuration.entity';
import { SubjectService } from './../subjects/subject.service';
import { AiRepository } from './ai.repository';
import { AskQuestionDto } from './dto/ask-question.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatMessage, MessageRole } from './entities/chat-message.entity';
import { Question, QuestionStatus } from './entities/question.entity';

@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name);

	constructor(
		private readonly aiRepository: AiRepository,
		private readonly aiModelService: AiModelConfigurationService,
		private readonly subjectService: SubjectService,
	) { }

	async askQuestion(data: AskQuestionDto): Promise<Question> {
		const aiModel = await this.aiModelService.getDefaultModel();
		// Create the question record
		const question = await this.aiRepository.createQuestion(data, aiModel.id);

		// Process the question asynchronously
		this.processQuestion(question).catch(error => {
			this.logger.error(`Failed to process question ${question.questionId}:`, error);
		});

		return question;
	}

	async getQuestion(questionId: string, userId?: number): Promise<Question> {
		const question = await this.aiRepository.findQuestionById(questionId);

		if (!question) {
			throw new NotFoundException('Question not found');
		}

		// Check if user has access to this question
		if (userId && question.userId !== userId) {
			throw new NotFoundException('Question not found');
		}

		return question;
	}

	async getQuestionWithMessages(questionId: string, userId?: number): Promise<Question> {
		const question = await this.aiRepository.findQuestionWithMessages(questionId);

		if (!question) {
			throw new NotFoundException('Question not found');
		}

		// Check if user has access to this question
		if (userId && question.userId !== userId) {
			throw new NotFoundException('Question not found');
		}

		return question;
	}

	async sendChatMessage(questionId: string, data: SendChatMessageDto, userId: number): Promise<ChatMessage> {
		// Verify the question exists and user has access
		const question = await this.getQuestion(questionId, userId);

		if (!question.isAnswered()) {
			throw new BadRequestException('Cannot send messages to unanswered questions');
		}

		// Create user message
		const userMessage = await this.aiRepository.createChatMessage({
			questionId: question.id,
			userId,
			role: MessageRole.USER,
			content: data.message,
		});

		// Process the AI response asynchronously
		this.processChatMessage(question, data.message, data.aiModelId).catch(error => {
			this.logger.error(`Failed to process chat message for question ${questionId}:`, error);
		});

		return userMessage;
	}

	async getUserQuestions(userId: number): Promise<Question[]> {
		return await this.aiRepository.findQuestionsByUserId(userId);
	}

	async getChatHistory(questionId: string, userId?: number): Promise<ChatMessage[]> {
		// Verify access if userId is provided
		if (userId) {
			await this.getQuestion(questionId, userId);
		}

		const question = await this.aiRepository.findQuestionById(questionId);
		if (!question) {
			throw new NotFoundException('Question not found');
		}

		return await this.aiRepository.findChatMessagesByQuestionId(question.id);
	}

	async getQuestionStats(userId?: string) {
		return await this.aiRepository.getQuestionStats(userId);
	}

	// Private methods for AI processing

	private async processQuestion(question: Question): Promise<void> {
		const startTime = Date.now();

		try {
			// Get AI model to use
			const aiModel = await this.getAiModelForQuestion(question);

			if (!aiModel) {
				throw new Error('No AI model available');
			}

			// Generate the AI response
			const response = await this.generateAiResponse(question, aiModel);

			const processingTime = Date.now() - startTime;

			// Update question with answer
			await this.aiRepository.updateQuestionAnswer(
				question.questionId,
				response.content,
				QuestionStatus.ANSWERED,
				processingTime,
				response.tokenUsage,
			);

			this.logger.log(`Question ${question.id} processed successfully in ${processingTime}ms`);
		} catch (error) {
			console.log(error);

			const processingTime = Date.now() - startTime;

			await this.aiRepository.updateQuestionAnswer(
				question.questionId,
				null,
				QuestionStatus.FAILED,
				processingTime,
				null,
				error.message,
			);

			this.logger.error(`Question ${question.questionId} processing failed:`, error);
		}
	}

	private async processChatMessage(question: Question, message: string, aiModelId?: number): Promise<void> {
		const startTime = Date.now();

		try {
			// Get AI model to use
			const aiModel = await this.getAiModelForMessage(question, aiModelId);

			if (!aiModel) {
				throw new Error('No AI model available');
			}

			// Get conversation history
			const history = await this.aiRepository.getChatHistory(question.id);

			// Generate the AI response
			const response = await this.generateChatResponse(message, history, aiModel, question);

			const processingTime = Date.now() - startTime;

			// Save AI response
			await this.aiRepository.createChatMessage({
				questionId: question.id,
				userId: question.userId,
				role: MessageRole.ASSISTANT,
				content: response.content,
				aiModelId: aiModel.id,
				tokenUsage: response.tokenUsage,
				processingTimeMs: processingTime,
			});

			this.logger.log(`Chat message for question ${question.id} processed in ${processingTime}ms`);
		} catch (error) {
			this.logger.error(`Chat message processing failed for question ${question.id}:`, error);

			// Save error message
			await this.aiRepository.createChatMessage({
				questionId: question.id,
				userId: question.userId,
				role: MessageRole.ASSISTANT,
				content: 'I apologize, but I encountered an error processing your message. Please try again.',
				metadata: { error: error.message },
			});
		}
	}

	private async getAiModelForQuestion(question: Question): Promise<AiModelConfiguration | null> {
		if (question.aiModelId) {
			try {
				return await this.aiModelService.getModelById(question.aiModelId);
			} catch (error) {
				this.logger.warn(`Specified AI model ${question.aiModelId} not found, using default`);
			}
		}

		return await this.aiModelService.getDefaultModel();
	}

	private async getAiModelForMessage(question: Question, aiModelId?: number): Promise<AiModelConfiguration | null> {
		if (aiModelId) {
			try {
				return await this.aiModelService.getModelById(aiModelId);
			} catch (error) {
				this.logger.warn(`Specified AI model ${aiModelId} not found, using default`);
			}
		}

		return await this.getAiModelForQuestion(question);
	}

	private async generateAiResponse(
		question: Question,
		aiModel: AiModelConfiguration,
	): Promise<{ content: string; tokenUsage?: number; }> {
		const subject = await this.subjectService.findOne(question.subjectId);
		// Build the system prompt
		const systemPrompt = this.buildSystemPrompt(subject.name, subject.aiPrompt);

		// Build the user prompt
		const userPrompt = this.buildUserPrompt(question.question, question.fileAttachments);

		// Make API call based on provider
		return await this.callAiProvider(aiModel, [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		]);
	}

	private async generateChatResponse(
		message: string,
		history: { role: string; content: string; }[],
		aiModel: AiModelConfiguration,
		question: Question,
	): Promise<{ content: string; tokenUsage?: number; }> {
		// Build the conversation history
		const messages = [
			{ role: 'system', content: this.buildChatSystemPrompt(question) },
			...history,
			{ role: 'user', content: message },
		];

		return await this.callAiProvider(aiModel, messages);
	}

	private buildSystemPrompt(subject: string, aiPrompt: string): string {
		if (aiPrompt && aiPrompt.trim().length > 0) {
			return aiPrompt;
		}

		return `You are an expert AI tutor specializing in ${subject}. Your role is to:
			1. Provide clear, accurate, and educational explanations
			2. Break down complex problems step-by-step
			3. Encourage learning and understanding rather than just giving answers
			4. Ask clarifying questions when needed
			5. Provide examples and analogies to help with comprehension
			6. Be patient and supportive

			Please provide a comprehensive answer to the student's question.`
			;
	}

	private buildUserPrompt(question: string, fileAttachments?: string[]): string {
		let prompt = `Question: ${question}`;

		if (fileAttachments && fileAttachments.length > 0) {
			prompt += `\n\nAttached files: ${fileAttachments.join(', ')}`;
			prompt += '\nPlease consider the attached files in your response if relevant.';
		}

		return prompt;
	}

	private buildChatSystemPrompt(question: Question): string {
		return `You are continuing a conversation with a student about their ${question.subject} question. 
				Original question: "${question.question}"
				Your previous answer: "${question.answer}"

				Continue to help the student understand the topic. Be conversational and supportive.`;
	}

	private async callAiProvider(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
	): Promise<{ content: string; tokenUsage?: number; }> {
		const apiKey = await this.aiModelService.getDecryptedApiKey(aiModel.id);

		if (!apiKey) {
			throw new Error('No API key configured for AI model');
		}

		switch (aiModel.provider) {
			case AiProvider.OPENAI:
				return await this.callOpenAI(aiModel, messages, apiKey);
			case AiProvider.ANTHROPIC:
				return await this.callAnthropic(aiModel, messages, apiKey);
			case AiProvider.GOOGLE:
				return await this.callGoogleAI(aiModel, messages, apiKey);
			case AiProvider.CUSTOM:
				return await this.callCustomProvider(aiModel, messages, apiKey);
			default:
				throw new Error(`Unsupported AI provider: ${aiModel.provider}`);
		}
	}

	private async callOpenAI(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<{ content: string; tokenUsage?: number; }> {
		// Placeholder implementation - would use OpenAI SDK
		this.logger.log(`Calling OpenAI with model ${aiModel.modelName}`);

		// Mock response for now
		return {
			content: 'This is a mock response from OpenAI. The actual implementation would use the OpenAI API.',
			tokenUsage: 150,
		};
	}

	private async callAnthropic(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<{ content: string; tokenUsage?: number; }> {
		// Placeholder implementation - would use Anthropic SDK
		this.logger.log(`Calling Anthropic with model ${aiModel.modelName}`);

		return {
			content: 'This is a mock response from Anthropic. The actual implementation would use the Anthropic API.',
			tokenUsage: 120,
		};
	}

	private async callGoogleAI(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<{ content: string; tokenUsage?: number; }> {
		// Placeholder implementation - would use Google AI SDK
		this.logger.log(`Calling Google AI with model ${aiModel.modelName}`);

		return {
			content: 'This is a mock response from Google AI. The actual implementation would use the Google AI API.',
			tokenUsage: 140,
		};
	}

	private async callCustomProvider(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<{ content: string; tokenUsage?: number; }> {
		// Placeholder implementation - would make HTTP request to custom endpoint
		this.logger.log(`Calling custom provider at ${aiModel.apiEndpoint}`);

		return {
			content: 'This is a mock response from a custom provider. The actual implementation would make an HTTP request.',
			tokenUsage: 100,
		};
	}
}