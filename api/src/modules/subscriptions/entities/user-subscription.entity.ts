import { AbstractEntity } from '@/database/abstract.entity';
import { SubscriptionPackage } from '@/modules/settings/entities/subscription-package.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

export enum SubscriptionStatus {
	ACTIVE = 'active',
	CANCELED = 'canceled',
	PAST_DUE = 'past_due',
	UNPAID = 'unpaid',
	TRIALING = 'trialing',
	INCOMPLETE = 'incomplete',
	INCOMPLETE_EXPIRED = 'incomplete_expired',
	PAUSED = 'paused',
}

export enum PaymentStatus {
	SUCCEEDED = 'succeeded',
	PENDING = 'pending',
	FAILED = 'failed',
	REFUNDED = 'refunded',
}

@Entity('user_subscriptions')
@Index(['id'], { unique: false })
export class UserSubscription extends AbstractEntity<UserSubscription> {
	@Column({ name: 'user_id', type: 'int' })
	userId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id', referencedColumnName: "id" })
	user: User;

	// Package relationship
	@Column({ name: 'package_id', type: 'int', nullable: true })
	packageId?: number;

	@ManyToOne(() => SubscriptionPackage, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'package_id', referencedColumnName: "id" })
	package?: SubscriptionPackage;

	// Stripe IDs
	@Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true })
	stripeCustomerId?: string;

	@Column({ name: 'stripe_subscription_id', type: 'varchar', length: 255, nullable: true, unique: true })
	stripeSubscriptionId?: string;

	@Column({ name: 'stripe_price_id', type: 'varchar', length: 255, nullable: true })
	stripePriceId?: string;

	// Subscription Status
	@Column({
		name: 'status',
		type: 'enum',
		enum: SubscriptionStatus,
		default: SubscriptionStatus.INCOMPLETE,
	})
	status: SubscriptionStatus;

	// Payment Info
	@Column({
		name: 'payment_status',
		type: 'enum',
		enum: PaymentStatus,
		nullable: true,
	})
	paymentStatus?: PaymentStatus;

	@Column({ name: 'currency', type: 'varchar', length: 3, default: 'usd' })
	currency: string;

	@Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
	amount?: number;

	// Subscription Dates
	@Column({ name: 'current_period_start', type: 'timestamp', nullable: true })
	currentPeriodStart?: Date;

	@Column({ name: 'current_period_end', type: 'timestamp', nullable: true })
	currentPeriodEnd?: Date;

	@Column({ name: 'trial_start', type: 'timestamp', nullable: true })
	trialStart?: Date;

	@Column({ name: 'trial_end', type: 'timestamp', nullable: true })
	trialEnd?: Date;

	@Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
	canceledAt?: Date;

	@Column({ name: 'ended_at', type: 'timestamp', nullable: true })
	endedAt?: Date;

	// Cancellation
	@Column({ name: 'cancel_at_period_end', type: 'boolean', default: false })
	cancelAtPeriodEnd: boolean;

	@Column({ name: 'cancellation_reason', type: 'text', nullable: true })
	cancellationReason?: string;

	// Usage tracking for the current period
	@Column({ name: 'questions_used', type: 'int', default: 0 })
	questionsUsed: number;

	@Column({ name: 'chats_used', type: 'int', default: 0 })
	chatsUsed: number;

	@Column({ name: 'file_uploads_used', type: 'int', default: 0 })
	fileUploadsUsed: number;

	@Column({ name: 'usage_reset_at', type: 'timestamp', nullable: true })
	usageResetAt?: Date;

	// Metadata
	@Column({ name: 'metadata', type: 'simple-json', nullable: true })
	metadata?: Record<string, any>;

	// Helper methods
	isActive(): boolean {
		return this.status === SubscriptionStatus.ACTIVE || this.status === SubscriptionStatus.TRIALING;
	}

	isTrialing(): boolean {
		return this.status === SubscriptionStatus.TRIALING;
	}

	isCanceled(): boolean {
		return this.status === SubscriptionStatus.CANCELED || this.cancelAtPeriodEnd;
	}

	hasValidSubscription(): boolean {
		return this.isActive() && !this.isCanceled();
	}

	getRemainingDays(): number {
		if (!this.currentPeriodEnd) return 0;
		const now = new Date();
		const end = new Date(this.currentPeriodEnd);
		const diff = end.getTime() - now.getTime();
		return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	}

	getTrialRemainingDays(): number {
		if (!this.trialEnd) return 0;
		const now = new Date();
		const end = new Date(this.trialEnd);
		const diff = end.getTime() - now.getTime();
		return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	}

	canAskQuestion(maxQuestions?: number): boolean {
		if (!maxQuestions || maxQuestions === -1) return true; // Unlimited
		return this.questionsUsed < maxQuestions;
	}

	canStartChat(maxChats?: number): boolean {
		if (!maxChats || maxChats === -1) return true; // Unlimited
		return this.chatsUsed < maxChats;
	}

	canUploadFile(maxUploads?: number): boolean {
		if (!maxUploads || maxUploads === -1) return true; // Unlimited
		return this.fileUploadsUsed < maxUploads;
	}
}