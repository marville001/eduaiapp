import { DocumentMeta } from '@/common/class/document-meta';
import { AbstractEntity } from '@/database/abstract.entity';
import { AiModelConfiguration } from '@/modules/settings/entities/ai-model-configuration.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMessage } from './chat-message.entity';

export enum QuestionStatus {
	PENDING = 'pending',
	ANSWERED = 'answered',
	FAILED = 'failed',
}

@Entity('questions')
@Index(['id'], { unique: true })
export class Question extends AbstractEntity<Question> {
	@PrimaryGeneratedColumn('uuid', { name: 'question_id' })
	questionId: string;

	@Column({ name: 'subject_id', type: 'int' })
	subjectId: number;

	@Column({ name: 'user_id', type: 'int', nullable: true })
	userId?: number;

	@Column({ name: 'ai_model_id', type: 'int' })
	aiModelId?: number;

	@Column({ type: 'text' })
	question: string;

	@Column({ type: 'text', nullable: true })
	answer?: string;

	@Column({ type: 'enum', enum: QuestionStatus, default: QuestionStatus.PENDING })
	status: QuestionStatus;

	@Column({ name: 'processing_time_ms', type: 'integer', nullable: true })
	processingTimeMs?: number;

	@Column({ name: 'token_usage', type: 'integer', nullable: true })
	tokenUsage?: number;

	@Column({ name: 'file_attachments', type: 'json', nullable: true })
	fileAttachments?: DocumentMeta[];

	@Column({ name: 'error_message', type: 'text', nullable: true })
	errorMessage?: string;

	// Relations
	@ManyToOne(() => User, { eager: false })
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user?: User;

	@ManyToOne(() => Subject, (subject) => subject.questions)
	@JoinColumn({ name: 'subject_id', referencedColumnName: 'id' })
	subject: Subject;

	@ManyToOne(() => AiModelConfiguration, (aiModel) => aiModel.questions)
	@JoinColumn({ name: 'ai_model_id', referencedColumnName: 'id' })
	aiModel: AiModelConfiguration;

	@OneToMany(() => ChatMessage, (message) => message.question, { cascade: true })
	chatMessages: ChatMessage[];

	// Helper methods
	isAnswered(): boolean {
		return this.status === QuestionStatus.ANSWERED && !!this.answer;
	}

	hasFailed(): boolean {
		return this.status === QuestionStatus.FAILED;
	}

	isPending(): boolean {
		return this.status === QuestionStatus.PENDING;
	}

	getStatusDisplay(): string {
		switch (this.status) {
			case QuestionStatus.PENDING:
				return 'Processing...';
			case QuestionStatus.ANSWERED:
				return 'Answered';
			case QuestionStatus.FAILED:
				return 'Failed';
			default:
				return this.status;
		}
	}
}