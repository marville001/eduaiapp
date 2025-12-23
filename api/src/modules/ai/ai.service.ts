import { DocumentMeta } from '@/common/class/document-meta';
import { buildFileAccessUrl } from '@/utils/files';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AiModelConfigurationService } from '../settings/ai-model-configuration.service';
import { AiModelConfiguration, AiProvider } from '../settings/entities/ai-model-configuration.entity';
import { SubjectService } from './../subjects/subject.service';
import { AiRepository } from './ai.repository';
import { AskQuestionDto } from './dto/ask-question.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatMessage, MessageRole } from './entities/chat-message.entity';
import { Question, QuestionStatus } from './entities/question.entity';
import { AiResponse, OpenAiService, TokenUsageDetails } from './openai/openai.service';

// Re-export for use by other modules
export { AiResponse, TokenUsageDetails };

@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name);

	constructor(
		private readonly aiRepository: AiRepository,
		private readonly aiModelService: AiModelConfigurationService,
		private readonly subjectService: SubjectService,
		private readonly openAiService: OpenAiService,

	) { }

	async askQuestion(data: AskQuestionDto, attachedDocuments: DocumentMeta[]): Promise<Question> {
		const aiModel = await this.aiModelService.getDefaultModel();
		// Create the question record
		const question = await this.aiRepository.createQuestion(data, aiModel.id, attachedDocuments);

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

	async sendChatMessage(questionId: string, data: SendChatMessageDto): Promise<ChatMessage> {
		// Verify the question exists and user has access
		const question = await this.getQuestion(questionId);

		if (!question.isAnswered()) {
			// throw new BadRequestException('Cannot send messages to unanswered questions');
			throw new BadRequestException('Failed. Question processing is not yet complete.');
		}

		// Create user message
		const userMessage = await this.aiRepository.createChatMessage({
			questionId: question.id,
			userId: data.userId,
			role: MessageRole.USER,
			content: data.message,
		});

		// Process the AI response asynchronously
		await this.processChatMessage(question, data.message).catch(error => {
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

	async getQuestionStats(userId?: number) {
		return await this.aiRepository.getQuestionStats(userId);
	}

	// Admin methods
	async getAllQuestions(params?: {
		page?: number;
		limit?: number;
		status?: QuestionStatus;
		userId?: number;
		subjectId?: number;
		search?: string;
	}): Promise<{ questions: Question[]; total: number; }> {
		return await this.aiRepository.findAllQuestions(params);
	}

	async getQuestionForAdmin(questionId: string): Promise<Question> {
		const question = await this.aiRepository.findQuestionByIdForAdmin(questionId);

		if (!question) {
			throw new NotFoundException('Question not found');
		}

		return question;
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

			// Update question with answer and detailed token usage
			await this.aiRepository.updateQuestionAnswer(
				question.questionId,
				response.content,
				QuestionStatus.ANSWERED,
				processingTime,
				response.tokenUsage.totalTokens,
				undefined,
				{
					inputTokens: response.tokenUsage.inputTokens,
					outputTokens: response.tokenUsage.outputTokens,
					totalTokens: response.tokenUsage.totalTokens,
					modelName: response.modelName,
				},
			);

			this.logger.log(`Question ${question.id} processed successfully in ${processingTime}ms. Tokens: ${response.tokenUsage.inputTokens} in / ${response.tokenUsage.outputTokens} out`);
		} catch (error) {
			console.log(error);

			const processingTime = Date.now() - startTime;

			await this.aiRepository.updateQuestionAnswer(
				question.questionId,
				null,
				QuestionStatus.FAILED,
				processingTime,
				null,
				"Failed to process the question. Please try again later.",
				// error.message,
			);

			this.logger.error(`Question ${question.questionId} processing failed:`, error);
		}
	}

	private async processChatMessage(question: Question, message: string): Promise<void> {
		const startTime = Date.now();

		try {
			// Get AI model to use
			const aiModel = await this.getAiModelForMessage(question);

			if (!aiModel) {
				throw new Error('No AI model available');
			}

			// Get conversation history
			const history = await this.aiRepository.getChatHistory(question.id);

			// Generate the AI response
			const response = await this.generateChatResponse(message, history, aiModel, question);

			const processingTime = Date.now() - startTime;

			// Save AI response with detailed token usage
			await this.aiRepository.createChatMessage({
				questionId: question.id,
				userId: question.userId,
				role: MessageRole.ASSISTANT,
				content: response.content,
				aiModelId: aiModel.id,
				tokenUsage: response.tokenUsage.totalTokens,
				processingTimeMs: processingTime,
				metadata: {
					inputTokens: response.tokenUsage.inputTokens,
					outputTokens: response.tokenUsage.outputTokens,
					modelName: response.modelName,
				},
			});

			this.logger.log(`Chat message for question ${question.id} processed in ${processingTime}ms. Tokens: ${response.tokenUsage.inputTokens} in / ${response.tokenUsage.outputTokens} out`);
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

	private async getAiModelForMessage(question: Question): Promise<AiModelConfiguration | null> {
		return await this.getAiModelForQuestion(question);
	}

	private async generateAiResponse(
		question: Question,
		aiModel: AiModelConfiguration,
	): Promise<AiResponse> {
		const subject = await this.subjectService.findOne(question.subjectId);
		// Build the system prompt with LaTeX support if enabled
		const systemPrompt = this.buildSystemPrompt(subject.name, subject.aiPrompt, subject.useLatex);

		// Build the user prompt
		const userPrompt = this.buildUserPrompt(question.question, question.fileAttachments);

		// Make API call based on provider
		return await this.callAiProvider(aiModel, [
			{ role: 'system', content: systemPrompt },
			{
				role: 'user',
				content: (question?.fileAttachments && question?.fileAttachments.length > 0) ?
					[
						{ type: 'input_text', text: userPrompt },
						...(question.fileAttachments.map(file => ({
							type: file.mimeType.startsWith('image/') ? 'input_image' : 'input_file',
							[file.mimeType.startsWith('image/') ? "image_url" : "file_url"]: buildFileAccessUrl(file.accessKey)
						})))
					]
					: [{ type: 'input_text', text: userPrompt }],
			},
		]);
	}

	private async generateChatResponse(
		message: string,
		history: { role: string; content: string; }[],
		aiModel: AiModelConfiguration,
		question: Question,
	): Promise<AiResponse> {
		// Fetch subject to get LaTeX setting
		const subject = await this.subjectService.findOne(question.subjectId);

		// Build the conversation history
		const messages = [
			{ role: 'system', content: this.buildChatSystemPrompt(question, subject?.useLatex) },
			...history,
			{ role: 'user', content: message },
		];

		return await this.callAiProvider(aiModel, messages);
	}

	private buildSystemPrompt(subject: string, aiPrompt: string, useLatex: boolean = false): string {
		let basePrompt = '';

		if (aiPrompt && aiPrompt.trim().length > 0) {
			basePrompt = aiPrompt;
		} else {
			basePrompt = `You are an expert AI tutor specializing in ${subject}. Your role is to:
			1. Provide clear, accurate, and educational explanations
			2. Break down complex problems step-by-step
			3. Encourage learning and understanding rather than just giving answers
			4. Ask clarifying questions when needed
			5. Provide examples and analogies to help with comprehension
			6. Be patient and supportive

			Please provide a comprehensive answer to the student's question.`;
		}

		// Add LaTeX formatting instructions if enabled
		if (useLatex) {
			basePrompt += `

IMPORTANT: Format mathematical expressions using LaTeX notation:
- Use $...$ for inline math expressions (e.g., $x^2 + y^2 = z^2$)
- Use $$...$$ for display/block math expressions (e.g., $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$)
- Always use proper LaTeX commands for fractions (\\frac{}{}}), square roots (\\sqrt{}), integrals (\\int), summations (\\sum), etc.
- Ensure all mathematical formulas, equations, and expressions are properly formatted in LaTeX
- Use LaTeX for Greek letters (\\alpha, \\beta, \\gamma, etc.), operators, and mathematical symbols`;
		}

		return basePrompt;
	}

	private buildUserPrompt(question: string, fileAttachments?: DocumentMeta[]): string {
		let prompt = `Question: ${question}`;

		if (fileAttachments && fileAttachments.length > 0) {
			prompt += `\n\nAttached files: ${fileAttachments.map(f => buildFileAccessUrl(f.accessKey)).join(', ')}`;
			prompt += '\nPlease consider the attached files in your response if relevant.';
		}

		return prompt;
	}

	private buildChatSystemPrompt(question: Question, useLatex: boolean = false): string {
		let prompt = `You are continuing a conversation with a student about their ${question.subject} question. 
				Original question: "${question.question}"
				Your previous answer: "${question.answer}"

				Continue to help the student understand the topic. Be conversational and supportive.`;

		if (question.fileAttachments && question.fileAttachments.length > 0) {
			prompt += `\n\nAttached files: ${question.fileAttachments.map(f => buildFileAccessUrl(f.accessKey)).join(', ')}`;
			prompt += '\nPlease consider the attached files in your response if relevant.';
		}

		// Add LaTeX formatting instructions if enabled
		if (useLatex) {
			prompt += `

IMPORTANT: Format mathematical expressions using LaTeX notation:
- Use $...$ for inline math expressions (e.g., $x^2 + y^2 = z^2$)
- Use $$...$$ for display/block math expressions (e.g., $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$)
- Always use proper LaTeX commands for fractions (\\frac{}{}), square roots (\\sqrt{}), integrals (\\int), summations (\\sum), etc.
- Ensure all mathematical formulas, equations, and expressions are properly formatted in LaTeX
- Use LaTeX for Greek letters (\\alpha, \\beta, \\gamma, etc.), operators, and mathematical symbols`;
		}

		return prompt;
	}

	private async callAiProvider(
		aiModel: AiModelConfiguration,
		messages: any[],
	): Promise<AiResponse> {
		const apiKey = await this.aiModelService.getDecryptedApiKey(aiModel.id);

		if (!apiKey) {
			throw new Error('No API key configured for AI model');
		}

		switch (aiModel.provider) {
			case AiProvider.OPENAI:
				return await this.callOpenAI(messages);
			// case AiProvider.ANTHROPIC:
			// 	return await this.callAnthropic(aiModel, messages, apiKey);
			// case AiProvider.GOOGLE:
			// 	return await this.callGoogleAI(aiModel, messages, apiKey);
			// case AiProvider.CUSTOM:
			// 	return await this.callCustomProvider(aiModel, messages, apiKey);
			default:
				throw new Error(`Unsupported AI provider: ${aiModel.provider}`);
		}
	}

	private async callOpenAI(messages: any[]): Promise<AiResponse> {
		return await this.openAiService.chat(messages as any);
	}

	private async callAnthropic(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<AiResponse> {
		// Placeholder implementation - would use Anthropic SDK
		this.logger.log(`Calling Anthropic with model ${aiModel.modelName}`);

		return {
			content: 'This is a mock response from Anthropic. The actual implementation would use the Anthropic API.',
			tokenUsage: { inputTokens: 50, outputTokens: 70, totalTokens: 120 },
			modelName: aiModel.modelName,
		};
	}

	private async callGoogleAI(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<AiResponse> {
		// Placeholder implementation - would use Google AI SDK
		this.logger.log(`Calling Google AI with model ${aiModel.modelName}`);

		return {
			content: 'This is a mock response from Google AI. The actual implementation would use the Google AI API.',
			tokenUsage: { inputTokens: 60, outputTokens: 80, totalTokens: 140 },
			modelName: aiModel.modelName,
		};
	}

	private async callCustomProvider(
		aiModel: AiModelConfiguration,
		messages: { role: string; content: string; }[],
		apiKey: string,
	): Promise<AiResponse> {
		// Placeholder implementation - would make HTTP request to custom endpoint
		this.logger.log(`Calling custom provider at ${aiModel.apiEndpoint}`);

		return {
			content: 'This is a mock response from a custom provider. The actual implementation would make an HTTP request.',
			tokenUsage: { inputTokens: 40, outputTokens: 60, totalTokens: 100 },
			modelName: aiModel.modelName,
		};
	}
}