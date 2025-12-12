import { AbstractEntity } from '@/database/abstract.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

@Entity('user_credits')
@Index(['userId'], { unique: true })
export class UserCredits extends AbstractEntity<UserCredits> {
	@Column({ name: 'user_id', type: 'int' })
	userId: number;

	@OneToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user: User;

	/**
	 * Total available credits the user can spend
	 */
	@Column({ name: 'available_credits', type: 'decimal', precision: 12, scale: 2, default: 0 })
	availableCredits: number;

	/**
	 * Total credits ever allocated to this user (for analytics)
	 */
	@Column({ name: 'total_allocated', type: 'decimal', precision: 12, scale: 2, default: 0 })
	totalAllocated: number;

	/**
	 * Total credits ever consumed by this user (for analytics)
	 */
	@Column({ name: 'total_consumed', type: 'decimal', precision: 12, scale: 2, default: 0 })
	totalConsumed: number;

	/**
	 * Credits that will expire at the end of current billing cycle
	 * These are "use it or lose it" subscription credits
	 */
	@Column({ name: 'expiring_credits', type: 'decimal', precision: 12, scale: 2, default: 0 })
	expiringCredits: number;

	/**
	 * Credits purchased via top-up that don't expire (or have longer expiry)
	 */
	@Column({ name: 'purchased_credits', type: 'decimal', precision: 12, scale: 2, default: 0 })
	purchasedCredits: number;

	/**
	 * Date when expiring credits will expire
	 */
	@Column({ name: 'credits_expire_at', type: 'timestamp', nullable: true })
	creditsExpireAt?: Date;

	/**
	 * Last time credits were reset (start of billing cycle)
	 */
	@Column({ name: 'last_reset_at', type: 'timestamp', nullable: true })
	lastResetAt?: Date;

	/**
	 * Low credit warning threshold (user-configurable)
	 */
	@Column({ name: 'low_credit_threshold', type: 'int', default: 100 })
	lowCreditThreshold: number;

	/**
	 * Whether user has been notified about low credits this cycle
	 */
	@Column({ name: 'low_credit_notified', type: 'boolean', default: false })
	lowCreditNotified: boolean;

	// Helper methods
	hasCredits(amount: number = 1): boolean {
		return Number(this.availableCredits) >= amount;
	}

	isLowOnCredits(): boolean {
		return Number(this.availableCredits) <= this.lowCreditThreshold;
	}

	getUsagePercentage(totalMonthlyCredits: number): number {
		if (totalMonthlyCredits === 0) return 0;
		const consumed = Number(this.totalConsumed);
		return Math.round((consumed / totalMonthlyCredits) * 100);
	}
}
