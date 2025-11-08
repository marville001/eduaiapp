import { AbstractEntity } from '@/database/abstract.entity';
import { AiModelConfiguration } from '@/modules/settings/entities/ai-model-configuration.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';

export enum MessageRole {
	USER = 'user',
	ASSISTANT = 'assistant',
	SYSTEM = 'system',
}

@Entity('chat_messages')
@Index(['id'], { unique: true })
export class ChatMessage extends AbstractEntity<ChatMessage> {
	@PrimaryGeneratedColumn('uuid', { name: 'message_id' })
	messageId: string;

	@Column({ name: 'question_id', type: 'int' })
	questionId: number;

	@Column({ name: 'user_id', type: 'int', nullable: true })
	userId?: number;

	@Column({ type: 'enum', enum: MessageRole })
	role: MessageRole;

	@Column({ type: 'text' })
	content: string;

	@Column({ name: 'ai_model_id', type: 'int', nullable: true })
	aiModelId?: number;

	@Column({ name: 'token_usage', type: 'integer', nullable: true })
	tokenUsage?: number;

	@Column({ name: 'processing_time_ms', type: 'integer', nullable: true })
	processingTimeMs?: number;

	@Column({ type: 'json', nullable: true })
	metadata?: Record<string, any>;

	// Relations
	@ManyToOne(() => Question, (question) => question.chatMessages, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'question_id', referencedColumnName: 'id' })
	question: Question;

	@ManyToOne(() => AiModelConfiguration, (aiModel) => aiModel.chatMessages)
	@JoinColumn({ name: 'ai_model_id', referencedColumnName: 'id' })
	aiModel: AiModelConfiguration;

	@ManyToOne(() => User, { eager: false })
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user: User;

	// Helper methods
	isUserMessage(): boolean {
		return this.role === MessageRole.USER;
	}

	isAssistantMessage(): boolean {
		return this.role === MessageRole.ASSISTANT;
	}

	isSystemMessage(): boolean {
		return this.role === MessageRole.SYSTEM;
	}

	getRoleDisplay(): string {
		switch (this.role) {
			case MessageRole.USER:
				return 'You';
			case MessageRole.ASSISTANT:
				return 'AI Assistant';
			case MessageRole.SYSTEM:
				return 'System';
			default:
				return this.role;
		}
	}
}