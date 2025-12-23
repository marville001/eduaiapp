import { AbstractEntity } from '@/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

/**
 * Types of credit transactions for the ledger
 */
export enum CreditTransactionType {
	// Inbound transactions (credits added)
	SUBSCRIPTION_ALLOCATION = 'subscription_allocation', // Monthly credits from subscription
	SUBSCRIPTION_RENEWAL = 'subscription_renewal',       // Credits on subscription renewal
	TOP_UP_PURCHASE = 'top_up_purchase',                 // Purchased additional credits
	PROMOTIONAL = 'promotional',                         // Promotional/bonus credits
	REFUND = 'refund',                                   // Refunded credits
	ADMIN_ADJUSTMENT = 'admin_adjustment',               // Manual adjustment by admin
	SIGNUP_BONUS = 'signup_bonus',                       // Welcome credits for new users
	REFERRAL_BONUS = 'referral_bonus',                   // Credits from referral program

	// Outbound transactions (credits deducted)
	AI_QUESTION = 'ai_question',                         // Asked an AI question
	AI_CHAT_MESSAGE = 'ai_chat_message',                 // Chat message in conversation
	AI_DOCUMENT_ANALYSIS = 'ai_document_analysis',       // Document/file analysis
	AI_IMAGE_GENERATION = 'ai_image_generation',         // AI image generation
	AI_ADVANCED_MODEL = 'ai_advanced_model',             // Usage of premium AI models
	FEATURE_USAGE = 'feature_usage',                     // Generic feature usage

	// System transactions
	EXPIRATION = 'expiration',                           // Credits expired
	SUBSCRIPTION_DOWNGRADE = 'subscription_downgrade',   // Credits removed on downgrade
	SUBSCRIPTION_CANCELLATION = 'subscription_cancellation', // Credits removed on cancellation
}

/**
 * Status of the transaction
 */
export enum CreditTransactionStatus {
	PENDING = 'pending',
	COMPLETED = 'completed',
	FAILED = 'failed',
	REVERSED = 'reversed',
}

/**
 * Credit Transaction Entity - Acts as a ledger for all credit movements
 * Every credit change should be recorded here for full audit trail
 */
@Entity('credit_transactions')
@Index(['userId'])
@Index(['transactionType'])
@Index(['createdAt'])
@Index(['referenceId'])
export class CreditTransaction extends AbstractEntity<CreditTransaction> {
	@Column({ name: 'user_id', type: 'int' })
	userId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user: User;

	/**
	 * Type of transaction
	 */
	@Column({
		name: 'transaction_type',
		type: 'enum',
		enum: CreditTransactionType,
	})
	transactionType: CreditTransactionType;

	/**
	 * Amount of credits (positive for additions, negative for deductions)
	 */
	@Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2 })
	amount: number;

	/**
	 * Balance after this transaction
	 */
	@Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2 })
	balanceAfter: number;

	/**
	 * Balance before this transaction
	 */
	@Column({ name: 'balance_before', type: 'decimal', precision: 12, scale: 2 })
	balanceBefore: number;

	/**
	 * Transaction status
	 */
	@Column({
		name: 'status',
		type: 'enum',
		enum: CreditTransactionStatus,
		default: CreditTransactionStatus.COMPLETED,
	})
	status: CreditTransactionStatus;

	/**
	 * Human-readable description
	 */
	@Column({ name: 'description', type: 'varchar', length: 500 })
	description: string;

	/**
	 * Reference to related entity (e.g., question_id, subscription_id, payment_id)
	 */
	@Column({ name: 'reference_id', type: 'varchar', length: 255, nullable: true })
	referenceId?: string;

	/**
	 * Type of the referenced entity
	 */
	@Column({ name: 'reference_type', type: 'varchar', length: 100, nullable: true })
	referenceType?: string;

	/**
	 * IP address of the request (for security/fraud detection)
	 */
	@Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
	ipAddress?: string;

	/**
	 * User agent string (for analytics)
	 */
	@Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
	userAgent?: string;

	/**
	 * Additional metadata (JSON) - can store AI model used, token counts, etc.
	 */
	@Column({ name: 'metadata', type: 'simple-json', nullable: true })
	metadata?: Record<string, any>;

	// ==================== TOKEN USAGE FIELDS ====================

	/**
	 * Number of input tokens used (for AI operations)
	 */
	@Column({ name: 'input_tokens', type: 'int', nullable: true })
	inputTokens?: number;

	/**
	 * Number of output tokens used (for AI operations)
	 */
	@Column({ name: 'output_tokens', type: 'int', nullable: true })
	outputTokens?: number;

	/**
	 * Total tokens used (for AI operations)
	 */
	@Column({ name: 'total_tokens', type: 'int', nullable: true })
	totalTokens?: number;

	/**
	 * AI model used for this transaction
	 */
	@Column({ name: 'ai_model', type: 'varchar', length: 100, nullable: true })
	aiModel?: string;

	/**
	 * Token cost breakdown (JSON) - stores detailed pricing info
	 * { inputCost, outputCost, totalCost, minimumApplied, modelMultiplier, finalCost }
	 */
	@Column({ name: 'token_cost_breakdown', type: 'simple-json', nullable: true })
	tokenCostBreakdown?: {
		inputCost: number;
		outputCost: number;
		totalCost: number;
		minimumApplied: boolean;
		modelMultiplier: number;
		finalCost: number;
	};

	/**
	 * Expiration date for promotional/bonus credits
	 */
	@Column({ name: 'expires_at', type: 'timestamp', nullable: true })
	expiresAt?: Date;

	/**
	 * For reversed transactions, reference to original transaction
	 */
	@Column({ name: 'original_transaction_id', type: 'int', nullable: true })
	originalTransactionId?: number;

	// Helper methods
	isCredit(): boolean {
		return Number(this.amount) > 0;
	}

	isDebit(): boolean {
		return Number(this.amount) < 0;
	}

	isAiUsage(): boolean {
		return [
			CreditTransactionType.AI_QUESTION,
			CreditTransactionType.AI_CHAT_MESSAGE,
			CreditTransactionType.AI_DOCUMENT_ANALYSIS,
			CreditTransactionType.AI_IMAGE_GENERATION,
			CreditTransactionType.AI_ADVANCED_MODEL,
		].includes(this.transactionType);
	}

	getAbsoluteAmount(): number {
		return Math.abs(Number(this.amount));
	}

	hasTokenUsage(): boolean {
		return this.isAiUsage() && (this.inputTokens != null || this.outputTokens != null);
	}

	getTokenUsageSummary(): string {
		if (!this.hasTokenUsage()) return '';
		return `${this.inputTokens || 0} in / ${this.outputTokens || 0} out`;
	}
}
