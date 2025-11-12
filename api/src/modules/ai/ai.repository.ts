import { DocumentMeta } from '@/common/class/document-meta';
import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AskQuestionDto } from './dto/ask-question.dto';
import { ChatMessage, MessageRole } from './entities/chat-message.entity';
import { Question, QuestionStatus } from './entities/question.entity';

@Injectable()
export class AiRepository extends AbstractRepository<Question> {
	constructor(
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(ChatMessage)
		private readonly chatMessageRepository: Repository<ChatMessage>,
	) {
		super(questionRepository);
	}

	// Question methods
	async createQuestion(data: AskQuestionDto, aiModelId: number, attachments: DocumentMeta[] = []): Promise<Question> {
		const question = this.questionRepository.create({
			subjectId: data.subject,
			question: data.question,
			userId: data.userId,
			aiModelId,
			status: QuestionStatus.PENDING,
			fileAttachments: attachments,
		});

		return await this.questionRepository.save(question);
	}

	async updateQuestionAnswer(
		questionId: string,
		answer: string,
		status: QuestionStatus,
		processingTimeMs?: number,
		tokenUsage?: number,
		errorMessage?: string,
	): Promise<Question> {
		console.log({ questionId });
		const question = await this.findQuestionById(questionId);
		console.log({ question });

		await this.questionRepository.update({ questionId }, {
			answer,
			status,
			processingTimeMs,
			tokenUsage,
			errorMessage,
		});

		return await this.findQuestionById(questionId);
	}

	async findQuestionById(questionId: string): Promise<Question | null> {
		return await this.questionRepository.findOne({
			where: { questionId },
			relations: ['user', 'subject'],
		});
	}

	async findQuestionsByUserId(userId: number): Promise<Question[]> {
		return await this.questionRepository.find({
			where: { userId },
			order: { createdAt: 'DESC' },
			relations: ['user', 'subject'],
		});
	}

	async findQuestionWithMessages(questionId: string): Promise<Question | null> {
		const question = await this.questionRepository.findOne({
			where: { questionId },
			relations: ['user', 'subject'],
		});

		if (question) {
			// Load chat messages separately with proper ordering
			const messages = await this.findChatMessagesByQuestionId(question.id);
			(question as any).chatMessages = messages;
		}

		return question;
	}

	// Chat message methods
	async createChatMessage(data: {
		questionId: number;
		userId?: number;
		role: MessageRole;
		content: string;
		aiModelId?: number;
		tokenUsage?: number;
		processingTimeMs?: number;
		metadata?: Record<string, any>;
	}): Promise<ChatMessage> {
		const message = this.chatMessageRepository.create(data);
		return await this.chatMessageRepository.save(message);
	}

	async findChatMessagesByQuestionId(questionId: number): Promise<ChatMessage[]> {
		return await this.chatMessageRepository.find({
			where: { questionId },
			order: { createdAt: 'ASC' },
			relations: ['user'],
		});
	}

	async getChatHistory(questionId: number): Promise<{ role: string; content: string; }[]> {
		const messages = await this.chatMessageRepository.find({
			where: { questionId },
			order: { createdAt: 'ASC' },
			select: ['role', 'content'],
		});

		return messages.map(msg => ({
			role: msg.role,
			content: msg.content,
		}));
	}

	// Statistics methods
	async getQuestionStats(userId?: string): Promise<{
		total: number;
		answered: number;
		pending: number;
		failed: number;
	}> {
		const query = this.questionRepository.createQueryBuilder('question');

		if (userId) {
			query.where('question.userId = :userId', { userId });
		}

		const [
			total,
			answered,
			pending,
			failed,
		] = await Promise.all([
			query.getCount(),
			query.clone().andWhere('question.status = :status', { status: QuestionStatus.ANSWERED }).getCount(),
			query.clone().andWhere('question.status = :status', { status: QuestionStatus.PENDING }).getCount(),
			query.clone().andWhere('question.status = :status', { status: QuestionStatus.FAILED }).getCount(),
		]);

		return { total, answered, pending, failed };
	}
}