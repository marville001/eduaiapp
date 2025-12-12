import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { SubscriptionPackageRepository } from '../settings/subscription-package.repository';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PaymentStatus, SubscriptionStatus, UserSubscription } from './entities/user-subscription.entity';
import { StripeService } from './stripe.service';
import { UserSubscriptionRepository } from './user-subscription.repository';

@Injectable()
export class SubscriptionsService {
	private readonly logger = new Logger(SubscriptionsService.name);

	constructor(
		private readonly subscriptionRepository: UserSubscriptionRepository,
		private readonly packageRepository: SubscriptionPackageRepository,
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	/**
	 * Get user's current subscription
	 */
	async getCurrentSubscription(userId: number): Promise<UserSubscription | null> {
		return this.subscriptionRepository.findCurrentByUserId(userId);
	}

	/**
	 * Get user's active subscription
	 */
	async getActiveSubscription(userId: number): Promise<UserSubscription | null> {
		return this.subscriptionRepository.findActiveByUserId(userId);
	}

	/**
	 * Create checkout session for subscription upgrade
	 */
	async createCheckoutSession(userId: number, dto: CreateCheckoutSessionDto, userEmail: string) {
		// Get package
		const pkg = await this.packageRepository.findOne({
			where: { id: dto.packageId, isActive: true },
		});

		if (!pkg) {
			throw new NotFoundException('Subscription package not found or not active');
		}

		// Check if package is configured with Stripe
		if (!pkg.stripePriceId) {
			throw new BadRequestException('This package is not configured for online payments');
		}

		// Check if user already has an active subscription
		const existingSubscription = await this.getActiveSubscription(userId);

		console.log({ existingSubscription });

		// Get or create Stripe customer
		let stripeCustomerId: string;

		if (existingSubscription?.stripeCustomerId) {
			stripeCustomerId = existingSubscription.stripeCustomerId;
		} else {
			const customer = await this.stripeService.createCustomer(userEmail, undefined, {
				userId: userId.toString(),
			});
			stripeCustomerId = customer.id;
		}

		console.log({ stripeCustomerId });


		// Build URLs
		const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
		const successUrl = dto.successUrl || `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = dto.cancelUrl || `${frontendUrl}/pricing`;

		// Create checkout session
		const session = await this.stripeService.createCheckoutSession({
			customerId: stripeCustomerId,
			priceId: pkg.stripePriceId,
			successUrl,
			cancelUrl,
			metadata: {
				userId: userId.toString(),
				packageId: pkg.id.toString(),
				packageName: pkg.name,
			},
			trialPeriodDays: pkg.trialPeriodDays,
			promotionCode: dto.promotionCode,
		});

		this.logger.log(`Created checkout session for user ${userId}, package ${pkg.name}`);

		return {
			sessionId: session.id,
			sessionUrl: session.url,
			package: pkg,
		};
	}

	/**
	 * Handle successful checkout (called by webhook)
	 */
	async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
		const userId = parseInt(session.metadata?.userId || '0');
		const packageId = parseInt(session.metadata?.packageId || '0');

		if (!userId || !packageId) {
			this.logger.error('Invalid metadata in checkout session', session.metadata);
			throw new BadRequestException('Invalid session metadata');
		}

		// Get subscription from Stripe
		const stripeSubscription = await this.stripeService.getSubscription(session.subscription as string);

		// Get package
		const pkg = await this.packageRepository.findOne({ where: { id: packageId } });

		if (!pkg) {
			throw new NotFoundException('Package not found');
		}

		// Check if subscription already exists
		let userSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(stripeSubscription.id);
		const firstSubscriptionItem = stripeSubscription?.items?.data?.[0];

		if (!userSubscription) {
			// Create new subscription

			userSubscription = this.subscriptionRepository.create({
				userId,
				packageId: pkg.id,
				stripeCustomerId: session.customer as string,
				stripeSubscriptionId: stripeSubscription.id,
				stripePriceId: stripeSubscription.items.data[0].price.id,
				status: this.mapStripeStatus(stripeSubscription.status),
				paymentStatus: PaymentStatus.SUCCEEDED,
				currency: stripeSubscription.currency,
				amount: stripeSubscription.items.data[0].price.unit_amount! / 100,
				currentPeriodStart: new Date(firstSubscriptionItem.current_period_start * 1000),
				currentPeriodEnd: new Date(firstSubscriptionItem.current_period_end * 1000),
				trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : undefined,
				trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
				usageResetAt: new Date(),
				metadata: {
					stripeSessionId: session.id,
				},
			});
		} else {
			// Update existing subscription
			userSubscription.status = this.mapStripeStatus(stripeSubscription.status);
			userSubscription.paymentStatus = PaymentStatus.SUCCEEDED;
			userSubscription.currentPeriodStart = new Date(firstSubscriptionItem.current_period_start * 1000);
			userSubscription.currentPeriodEnd = new Date(firstSubscriptionItem.current_period_end * 1000);
		}

		await this.subscriptionRepository.save(userSubscription);

		// Emit event
		this.eventEmitter.emit('subscription.created', {
			userId,
			subscription: userSubscription,
			package: pkg,
		});

		this.logger.log(`Subscription created/updated for user ${userId}`);

		return userSubscription;
	}

	/**
	 * Handle subscription updated (called by webhook)
	 */
	async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
		const userSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(subscription.id);

		if (!userSubscription) {
			this.logger.warn(`Subscription not found for Stripe ID: ${subscription.id}`);
			return;
		}

		const firstSubscriptionItem = subscription?.items?.data?.[0];

		// Update subscription
		userSubscription.status = this.mapStripeStatus(subscription.status);
		userSubscription.currentPeriodStart = new Date(firstSubscriptionItem.current_period_start * 1000);
		userSubscription.currentPeriodEnd = new Date(firstSubscriptionItem.current_period_end * 1000);
		userSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

		if (subscription.canceled_at) {
			userSubscription.canceledAt = new Date(subscription.canceled_at * 1000);
		}

		if (subscription.ended_at) {
			userSubscription.endedAt = new Date(subscription.ended_at * 1000);
		}

		// Check if price changed (upgrade/downgrade)
		const newPriceId = subscription.items.data[0].price.id;
		if (newPriceId !== userSubscription.stripePriceId) {
			userSubscription.stripePriceId = newPriceId;
			userSubscription.amount = subscription.items.data[0].price.unit_amount! / 100;

			// Find new package
			const newPackage = await this.packageRepository.findOne({
				where: { stripePriceId: newPriceId },
			});

			if (newPackage) {
				userSubscription.packageId = newPackage.id;
				// Reset usage counters on plan change
				await this.subscriptionRepository.resetUsageCounters(userSubscription.id);
			}
		}

		await this.subscriptionRepository.save(userSubscription);

		// Emit event
		this.eventEmitter.emit('subscription.updated', {
			userId: userSubscription.userId,
			subscription: userSubscription,
		});

		this.logger.log(`Subscription updated for user ${userSubscription.userId}`);
	}

	/**
	 * Handle subscription deleted (called by webhook)
	 */
	async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
		const userSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(subscription.id);

		if (!userSubscription) {
			this.logger.warn(`Subscription not found for Stripe ID: ${subscription.id}`);
			return;
		}

		// Update subscription status
		userSubscription.status = SubscriptionStatus.CANCELED;
		userSubscription.endedAt = new Date(subscription.ended_at! * 1000);

		await this.subscriptionRepository.save(userSubscription);

		// Emit event
		this.eventEmitter.emit('subscription.deleted', {
			userId: userSubscription.userId,
			subscription: userSubscription,
		});

		this.logger.log(`Subscription canceled for user ${userSubscription.userId}`);
	}

	/**
	 * Handle invoice payment succeeded
	 */
	async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
		// if (!invoice.customer) return;

		// const userSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(invoice.subscription as string);

		// if (!userSubscription) {
		// 	this.logger.warn(`Subscription not found for invoice: ${invoice.id}`);
		// 	return;
		// }

		// // Update payment status
		// userSubscription.paymentStatus = PaymentStatus.SUCCEEDED;

		// // Reset usage counters at the start of new billing period
		// if (invoice.billing_reason === 'subscription_cycle') {
		// 	await this.subscriptionRepository.resetUsageCounters(userSubscription.id);
		// 	this.logger.log(`Usage counters reset for user ${userSubscription.userId}`);
		// }

		// await this.subscriptionRepository.save(userSubscription);

		// this.eventEmitter.emit('invoice.payment_succeeded', {
		// 	userId: userSubscription.userId,
		// 	subscription: userSubscription,
		// 	invoice,
		// });
	}

	/**
	 * Handle invoice payment failed
	 */
	async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
		// if (!invoice.subscription) return;

		// const userSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(invoice.subscription as string);

		// if (!userSubscription) {
		// 	this.logger.warn(`Subscription not found for invoice: ${invoice.id}`);
		// 	return;
		// }

		// // Update payment status
		// userSubscription.paymentStatus = PaymentStatus.FAILED;
		// await this.subscriptionRepository.save(userSubscription);

		// this.eventEmitter.emit('invoice.payment_failed', {
		// 	userId: userSubscription.userId,
		// 	subscription: userSubscription,
		// 	invoice,
		// });

		// this.logger.warn(`Payment failed for user ${userSubscription.userId}`);
	}

	/**
	 * Cancel subscription
	 */
	async cancelSubscription(userId: number, dto: CancelSubscriptionDto) {
		const subscription = await this.getActiveSubscription(userId);

		if (!subscription) {
			throw new NotFoundException('No active subscription found');
		}

		if (!subscription.stripeSubscriptionId) {
			throw new BadRequestException('Subscription is not managed by Stripe');
		}

		// Cancel in Stripe
		const stripeSubscription = await this.stripeService.cancelSubscription(
			subscription.stripeSubscriptionId,
			dto.cancelAtPeriodEnd,
		);

		// Update local subscription
		subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
		subscription.cancellationReason = dto.cancellationReason;

		if (!dto.cancelAtPeriodEnd) {
			subscription.status = SubscriptionStatus.CANCELED;
			subscription.canceledAt = new Date();
		}

		await this.subscriptionRepository.save(subscription);

		this.eventEmitter.emit('subscription.canceled', {
			userId,
			subscription,
			cancelAtPeriodEnd: dto.cancelAtPeriodEnd,
		});

		this.logger.log(`Subscription canceled for user ${userId}`);

		return subscription;
	}

	/**
	 * Reactivate canceled subscription
	 */
	async reactivateSubscription(userId: number) {
		const subscription = await this.getActiveSubscription(userId);

		if (!subscription) {
			throw new NotFoundException('No subscription found');
		}

		if (!subscription.cancelAtPeriodEnd) {
			throw new BadRequestException('Subscription is not scheduled for cancellation');
		}

		if (!subscription.stripeSubscriptionId) {
			throw new BadRequestException('Subscription is not managed by Stripe');
		}

		// Reactivate in Stripe
		await this.stripeService.reactivateSubscription(subscription.stripeSubscriptionId);

		// Update local subscription
		subscription.cancelAtPeriodEnd = false;
		subscription.cancellationReason = null;

		await this.subscriptionRepository.save(subscription);

		this.logger.log(`Subscription reactivated for user ${userId}`);

		return subscription;
	}

	/**
	 * Update subscription (upgrade/downgrade)
	 */
	async updateSubscription(userId: number, dto: UpdateSubscriptionDto) {
		const subscription = await this.getActiveSubscription(userId);

		if (!subscription) {
			throw new NotFoundException('No active subscription found');
		}

		if (!subscription.stripeSubscriptionId) {
			throw new BadRequestException('Subscription is not managed by Stripe');
		}

		// Get new package
		const newPackage = await this.packageRepository.findOne({
			where: { id: dto.newPackageId, isActive: true },
		});

		if (!newPackage) {
			throw new NotFoundException('New package not found or not active');
		}

		if (!newPackage.stripePriceId) {
			throw new BadRequestException('New package is not configured for Stripe');
		}

		// Update in Stripe
		await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, newPackage.stripePriceId, true);

		this.logger.log(`Subscription updated for user ${userId} to package ${newPackage.name}`);

		// Subscription will be updated via webhook
		return {
			message: 'Subscription update initiated',
			newPackage: newPackage,
		};
	}

	/**
	 * Get billing portal URL
	 */
	async getBillingPortalUrl(userId: number): Promise<string> {
		const subscription = await this.getCurrentSubscription(userId);

		if (!subscription?.stripeCustomerId) {
			throw new NotFoundException('No Stripe customer found');
		}

		const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
		const returnUrl = `${frontendUrl}/app/subscription`;

		const session = await this.stripeService.createBillingPortalSession(subscription.stripeCustomerId, returnUrl);

		return session.url;
	}

	/**
	 * Get usage statistics
	 */
	async getUsageStatistics(userId: number) {
		const subscription = await this.getActiveSubscription(userId);

		if (!subscription) {
			return {
				hasSubscription: false,
				questionsUsed: 0,
				chatsUsed: 0,
				fileUploadsUsed: 0,
				questionsLimit: 0,
				chatsLimit: 0,
				fileUploadsLimit: 0,
			};
		}

		await subscription.package;

		return {
			hasSubscription: true,
			questionsUsed: subscription.questionsUsed,
			chatsUsed: subscription.chatsUsed,
			fileUploadsUsed: subscription.fileUploadsUsed,
			questionsLimit: subscription.package?.maxQuestionsPerMonth || 0,
			chatsLimit: subscription.package?.maxChatsPerMonth || 0,
			fileUploadsLimit: subscription.package?.maxFileUploads || 0,
			questionsRemaining: this.calculateRemaining(subscription.questionsUsed, subscription.package?.maxQuestionsPerMonth),
			chatsRemaining: this.calculateRemaining(subscription.chatsUsed, subscription.package?.maxChatsPerMonth),
			fileUploadsRemaining: this.calculateRemaining(subscription.fileUploadsUsed, subscription.package?.maxFileUploads),
			usageResetAt: subscription.usageResetAt,
			currentPeriodEnd: subscription.currentPeriodEnd,
		};
	}

	/**
	 * Check if user can perform action
	 */
	async canPerformAction(userId: number, action: 'question' | 'chat' | 'upload'): Promise<boolean> {
		const subscription = await this.getActiveSubscription(userId);

		if (!subscription || !subscription.isActive()) {
			return false;
		}

		await subscription.package;

		switch (action) {
			case 'question':
				return subscription.canAskQuestion(subscription.package?.maxQuestionsPerMonth);
			case 'chat':
				return subscription.canStartChat(subscription.package?.maxChatsPerMonth);
			case 'upload':
				return subscription.canUploadFile(subscription.package?.maxFileUploads);
			default:
				return false;
		}
	}

	/**
	 * Increment usage
	 */
	async incrementUsage(userId: number, action: 'question' | 'chat' | 'upload'): Promise<void> {
		const subscription = await this.getActiveSubscription(userId);

		if (!subscription) {
			return;
		}

		switch (action) {
			case 'question':
				await this.subscriptionRepository.incrementQuestionUsage(subscription.id);
				break;
			case 'chat':
				await this.subscriptionRepository.incrementChatUsage(subscription.id);
				break;
			case 'upload':
				await this.subscriptionRepository.incrementFileUploadUsage(subscription.id);
				break;
		}
	}

	/**
	 * Map Stripe status to our status
	 */
	private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
		const statusMap: Record<string, SubscriptionStatus> = {
			active: SubscriptionStatus.ACTIVE,
			canceled: SubscriptionStatus.CANCELED,
			past_due: SubscriptionStatus.PAST_DUE,
			unpaid: SubscriptionStatus.UNPAID,
			trialing: SubscriptionStatus.TRIALING,
			incomplete: SubscriptionStatus.INCOMPLETE,
			incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
			paused: SubscriptionStatus.PAUSED,
		};

		return statusMap[stripeStatus] || SubscriptionStatus.INCOMPLETE;
	}

	/**
	 * Calculate remaining usage
	 */
	private calculateRemaining(used: number, limit?: number): number | string {
		if (!limit || limit === -1) return 'Unlimited';
		return Math.max(0, limit - used);
	}
}
