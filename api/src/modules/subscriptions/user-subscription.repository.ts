import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SubscriptionStatus, UserSubscription } from './entities/user-subscription.entity';

@Injectable()
export class UserSubscriptionRepository extends Repository<UserSubscription> {
	constructor(private dataSource: DataSource) {
		super(UserSubscription, dataSource.createEntityManager());
	}

	/**
	 * Find active subscription for a user
	 */
	async findActiveByUserId(userId: number): Promise<UserSubscription | null> {
		return this.findOne({
			where: {
				userId,
				status: SubscriptionStatus.ACTIVE,
			},
			relations: ['package'],
		});
	}

	/**
	 * Find subscription by Stripe subscription ID
	 */
	async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<UserSubscription | null> {
		return this.findOne({
			where: { stripeSubscriptionId },
			relations: ['package', 'user'],
		});
	}

	/**
	 * Find subscription by Stripe customer ID
	 */
	async findByStripeCustomerId(stripeCustomerId: string): Promise<UserSubscription[]> {
		return this.find({
			where: { stripeCustomerId },
			relations: ['package'],
			order: { createdAt: 'DESC' },
		});
	}

	/**
	 * Find all subscriptions for a user
	 */
	async findAllByUserId(userId: number): Promise<UserSubscription[]> {
		return this.find({
			where: { userId },
			relations: ['package'],
			order: { createdAt: 'DESC' },
		});
	}

	/**
	 * Get user's current or latest subscription
	 */
	async findCurrentByUserId(userId: number): Promise<UserSubscription | null> {
		const subscriptions = await this.find({
			where: { userId },
			relations: ['package'],
			order: { createdAt: 'DESC' },
			take: 1,
		});

		return subscriptions[0] || null;
	}

	/**
	 * Count active subscriptions
	 */
	async countActiveSubscriptions(): Promise<number> {
		return this.count({
			where: {
				status: SubscriptionStatus.ACTIVE,
			},
		});
	}

	/**
	 * Find subscriptions expiring soon
	 */
	async findExpiringSubscriptions(daysThreshold: number): Promise<UserSubscription[]> {
		const thresholdDate = new Date();
		thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

		return this.createQueryBuilder('subscription')
			.where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
			.andWhere('subscription.currentPeriodEnd <= :threshold', { threshold: thresholdDate })
			.andWhere('subscription.cancelAtPeriodEnd = :cancel', { cancel: false })
			.leftJoinAndSelect('subscription.package', 'package')
			.leftJoinAndSelect('subscription.user', 'user')
			.getMany();
	}

	/**
	 * Reset usage counters for a subscription
	 */
	async resetUsageCounters(subscriptionId: number): Promise<void> {
		await this.update(subscriptionId, {
			questionsUsed: 0,
			chatsUsed: 0,
			fileUploadsUsed: 0,
			usageResetAt: new Date(),
		});
	}

	/**
	 * Increment question usage
	 */
	async incrementQuestionUsage(subscriptionId: number): Promise<void> {
		await this.increment({ id: subscriptionId }, 'questionsUsed', 1);
	}

	/**
	 * Increment chat usage
	 */
	async incrementChatUsage(subscriptionId: number): Promise<void> {
		await this.increment({ id: subscriptionId }, 'chatsUsed', 1);
	}

	/**
	 * Increment file upload usage
	 */
	async incrementFileUploadUsage(subscriptionId: number): Promise<void> {
		await this.increment({ id: subscriptionId }, 'fileUploadsUsed', 1);
	}
}
