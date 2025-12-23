import {
	BadRequestException,
	Injectable,
	Logger,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { AiModelConfigurationService } from '../settings/ai-model-configuration.service';
import { UserSubscriptionRepository } from '../subscriptions/user-subscription.repository';
import { CreditTransactionRepository } from './credit-transaction.repository';
import { CreditTransaction, CreditTransactionStatus, CreditTransactionType } from './entities/credit-transaction.entity';
import {
	calculateTokenCost,
	estimateOperationCost,
	TokenCostBreakdown,
	TokenPricingConfig,
	TokenUsage,
} from './token-pricing.config';
import { UserCreditsRepository } from './user-credits.repository';

/**
 * @deprecated Use token-based pricing instead
 * Legacy fixed costs per AI operation - kept for backward compatibility
 * The new system calculates costs based on actual input/output tokens
 */
export const CREDIT_COSTS = {
	[CreditTransactionType.AI_QUESTION]: 5,           // Base cost for asking a question
	[CreditTransactionType.AI_CHAT_MESSAGE]: 2,      // Cost per chat message
	[CreditTransactionType.AI_DOCUMENT_ANALYSIS]: 10, // Cost for document analysis
	[CreditTransactionType.AI_IMAGE_GENERATION]: 20,  // Cost for image generation
	[CreditTransactionType.AI_ADVANCED_MODEL]: 10,    // Additional cost for premium models
	[CreditTransactionType.FEATURE_USAGE]: 1,        // Generic feature usage
} as const;

export interface ConsumeCreditsDto {
	userId: number;
	transactionType: CreditTransactionType;
	amount?: number; // Optional override for dynamic pricing (deprecated)
	description: string;
	referenceId?: string;
	referenceType?: string;
	metadata?: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
	// New token-based fields
	tokenUsage?: TokenUsage;
	modelName?: string;
}

export interface AllocateCreditsDto {
	userId: number;
	amount: number;
	transactionType: CreditTransactionType;
	description: string;
	referenceId?: string;
	referenceType?: string;
	expiresAt?: Date;
	isExpiring?: boolean;
	metadata?: Record<string, any>;
}

export interface CreditBalance {
	available: number;
	expiring: number;
	purchased: number;
	totalConsumed: number;
	totalAllocated: number;
	expiresAt?: Date;
	isLowOnCredits: boolean;
}

@Injectable()
export class CreditService {
	private readonly logger = new Logger(CreditService.name);

	constructor(
		private readonly userCreditsRepo: UserCreditsRepository,
		private readonly transactionRepo: CreditTransactionRepository,
		private readonly subscriptionRepo: UserSubscriptionRepository,
		private readonly eventEmitter: EventEmitter2,
		private readonly aiModelConfigService: AiModelConfigurationService,
	) { }

	// ==================== BALANCE OPERATIONS ====================

	/**
	 * Get user's current credit balance
	 */
	async getBalance(userId: number): Promise<CreditBalance> {
		const credits = await this.userCreditsRepo.findOrCreate(userId);

		return {
			available: Number(credits.availableCredits),
			expiring: Number(credits.expiringCredits || 0),
			purchased: Number(credits.purchasedCredits || 0),
			totalConsumed: Number(credits.totalConsumed),
			totalAllocated: Number(credits.totalAllocated),
			expiresAt: credits.creditsExpireAt,
			isLowOnCredits: credits.isLowOnCredits(),
		};
	}

	/**
	 * Check if user has sufficient credits
	 */
	async hasCredits(userId: number, amount: number): Promise<boolean> {
		const credits = await this.userCreditsRepo.findByUserId(userId);
		if (!credits) return false;
		return credits.hasCredits(amount);
	}

	/**
	 * @deprecated Use token-based pricing instead
	 * Get the legacy fixed cost for a specific operation
	 */
	getCreditCost(transactionType: CreditTransactionType): number {
		return CREDIT_COSTS[transactionType] || 1;
	}

	/**
	 * Get the user's credit multiplier from their active subscription
	 * Returns 1.0 if no active subscription (normal cost)
	 */
	async getUserCreditMultiplier(userId: number): Promise<number> {
		const subscription = await this.subscriptionRepo.findActiveByUserId(userId);
		if (!subscription?.package) {
			return 1.0; // Default multiplier
		}
		return Number(subscription.package.creditMultiplier) || 1.0;
	}

	/**
	 * Get token pricing configuration from database for a specific model
	 * Falls back to default pricing if model not found in database
	 */
	async getModelTokenPricing(modelName: string): Promise<TokenPricingConfig | undefined> {
		try {
			const model = await this.aiModelConfigService.getModelByName(modelName);
			if (model) {
				return model.getTokenPricing();
			}
		} catch (error) {
			this.logger.warn(`Failed to fetch token pricing for model ${modelName}: ${error.message}`);
		}
		return undefined; // Will fall back to default pricing
	}

	/**
	 * Calculate token-based cost for an AI operation
	 * This is the new primary method for calculating costs
	 * Fetches pricing from database if available, falls back to defaults
	 */
	async calculateTokenBasedCost(
		userId: number,
		tokenUsage: TokenUsage,
		modelName: string,
	): Promise<TokenCostBreakdown> {
		const [userMultiplier, modelPricing] = await Promise.all([
			this.getUserCreditMultiplier(userId),
			this.getModelTokenPricing(modelName),
		]);
		return calculateTokenCost(tokenUsage, modelName, userMultiplier, modelPricing);
	}

	/**
	 * Estimate cost for pre-authorization checks
	 * Uses estimated token counts based on operation type
	 * Fetches pricing from database if available, falls back to defaults
	 */
	async estimateOperationCost(
		userId: number,
		operationType: string,
		modelName: string = 'default',
	): Promise<TokenCostBreakdown> {
		const [userMultiplier, modelPricing] = await Promise.all([
			this.getUserCreditMultiplier(userId),
			this.getModelTokenPricing(modelName),
		]);
		return estimateOperationCost(operationType, modelName, userMultiplier, modelPricing);
	}

	/**
	 * @deprecated Use calculateTokenBasedCost instead
	 * Calculate the actual cost after applying the user's credit multiplier
	 */
	async calculateAdjustedCost(
		userId: number,
		transactionType: CreditTransactionType,
		customAmount?: number,
	): Promise<{ baseCost: number; multiplier: number; adjustedCost: number; }> {
		const baseCost = customAmount || this.getCreditCost(transactionType);
		const multiplier = await this.getUserCreditMultiplier(userId);
		const adjustedCost = Math.ceil(baseCost * multiplier); // Round up to avoid fractional credits
		return { baseCost, multiplier, adjustedCost };
	}

	// ==================== CREDIT CONSUMPTION ====================

	/**
	 * Consume credits for an AI operation
	 * This is the main method called by AI services
	 * 
	 * NEW: Supports token-based pricing when tokenUsage and modelName are provided
	 * LEGACY: Falls back to fixed costs when token info is not available
	 */
	async consumeCredits(dto: ConsumeCreditsDto): Promise<{
		success: boolean;
		transaction?: CreditTransaction;
		remainingBalance: number;
		error?: string;
		tokenCostBreakdown?: TokenCostBreakdown;
	}> {
		const { userId, transactionType, tokenUsage, modelName } = dto;

		let amount: number;
		let tokenCostBreakdown: TokenCostBreakdown | undefined;
		let baseCost: number;
		let multiplier: number;

		// Calculate cost based on token usage (new system) or fixed cost (legacy)
		if (tokenUsage && modelName) {
			// Token-based pricing
			tokenCostBreakdown = await this.calculateTokenBasedCost(userId, tokenUsage, modelName);
			amount = tokenCostBreakdown.finalCost;
			baseCost = tokenCostBreakdown.totalCost;
			multiplier = tokenCostBreakdown.modelMultiplier;
		} else {
			// Legacy fixed-cost pricing
			const adjustedCost = await this.calculateAdjustedCost(userId, transactionType, dto.amount);
			amount = adjustedCost.adjustedCost;
			baseCost = adjustedCost.baseCost;
			multiplier = adjustedCost.multiplier;
		}

		// Get current balance
		const credits = await this.userCreditsRepo.findOrCreate(userId);
		const currentBalance = Number(credits.availableCredits);

		// Check if user has enough credits
		if (currentBalance < amount) {
			this.logger.warn(`User ${userId} has insufficient credits. Required: ${amount}, Available: ${currentBalance}`);

			// Emit insufficient credits event for notifications
			this.eventEmitter.emit('credits.insufficient', {
				userId,
				required: amount,
				available: currentBalance,
				transactionType,
				tokenUsage,
			});

			return {
				success: false,
				remainingBalance: currentBalance,
				error: `Insufficient credits. Required: ${amount}, Available: ${currentBalance}`,
				tokenCostBreakdown,
			};
		}

		// Deduct credits atomically
		const { success, newBalance } = await this.userCreditsRepo.deductCredits(userId, amount);

		if (!success) {
			return {
				success: false,
				remainingBalance: currentBalance,
				error: 'Failed to deduct credits. Please try again.',
				tokenCostBreakdown,
			};
		}

		// Create transaction record with token usage info
		const transaction = await this.transactionRepo.create({
			userId,
			transactionType,
			amount: -amount, // Negative for consumption
			balanceBefore: currentBalance,
			balanceAfter: newBalance,
			description: dto.description,
			referenceId: dto.referenceId,
			referenceType: dto.referenceType,
			// Token usage fields
			inputTokens: tokenUsage?.inputTokens,
			outputTokens: tokenUsage?.outputTokens,
			totalTokens: tokenUsage?.totalTokens,
			aiModel: modelName,
			tokenCostBreakdown: tokenCostBreakdown ? {
				inputCost: tokenCostBreakdown.inputCost,
				outputCost: tokenCostBreakdown.outputCost,
				totalCost: tokenCostBreakdown.totalCost,
				minimumApplied: tokenCostBreakdown.minimumApplied,
				modelMultiplier: tokenCostBreakdown.modelMultiplier,
				finalCost: tokenCostBreakdown.finalCost,
			} : undefined,
			metadata: {
				...dto.metadata,
				baseCost,
				multiplier,
				adjustedCost: amount,
				pricingType: tokenUsage ? 'token-based' : 'legacy-fixed',
			},
			ipAddress: dto.ipAddress,
			userAgent: dto.userAgent,
			status: CreditTransactionStatus.COMPLETED,
		});

		const tokenInfo = tokenUsage
			? ` (${tokenUsage.inputTokens} in / ${tokenUsage.outputTokens} out tokens)`
			: '';
		this.logger.log(
			`Consumed ${amount} credits for user ${userId} (base: ${baseCost}, multiplier: ${multiplier})${tokenInfo}. New balance: ${newBalance}`
		);

		// Check if user is now low on credits
		if (newBalance <= credits.lowCreditThreshold && !credits.lowCreditNotified) {
			this.eventEmitter.emit('credits.low', {
				userId,
				balance: newBalance,
				threshold: credits.lowCreditThreshold,
			});
			await this.userCreditsRepo.markLowCreditNotified(userId);
		}

		// Emit consumption event
		this.eventEmitter.emit('credits.consumed', {
			userId,
			amount,
			transactionType,
			newBalance,
			transaction,
		});

		return {
			success: true,
			transaction,
			remainingBalance: newBalance,
		};
	}

	/**
	 * Pre-check if user can perform an operation
	 * Use this before expensive operations to fail fast
	 * 
	 * NEW: Uses token-based estimation for AI operations
	 * Estimates the cost based on typical token usage for the operation type
	 */
	async canPerformOperation(
		userId: number,
		transactionType: CreditTransactionType,
		customAmount?: number,
		modelName?: string,
	): Promise<{
		allowed: boolean;
		cost: number;
		balance: number;
		shortfall?: number;
		multiplier?: number;
		estimatedTokens?: { input: number; output: number; };
	}> {
		const balance = await this.getBalance(userId);

		// Use token-based estimation for AI operations
		const aiOperations = [
			CreditTransactionType.AI_QUESTION,
			CreditTransactionType.AI_CHAT_MESSAGE,
			CreditTransactionType.AI_DOCUMENT_ANALYSIS,
			CreditTransactionType.AI_IMAGE_GENERATION,
			CreditTransactionType.AI_ADVANCED_MODEL,
		];

		let cost: number;
		let multiplier: number;
		let estimatedTokens: { input: number; output: number; } | undefined;

		if (aiOperations.includes(transactionType)) {
			// Token-based estimation
			const operationType = transactionType.replace('ai_', '');
			const estimation = await this.estimateOperationCost(userId, operationType, modelName || 'default');
			cost = estimation.finalCost;
			multiplier = estimation.modelMultiplier;
			estimatedTokens = {
				input: estimation.inputTokens,
				output: estimation.outputTokens,
			};
		} else {
			// Legacy fixed cost for non-AI operations
			const adjusted = await this.calculateAdjustedCost(userId, transactionType, customAmount);
			cost = adjusted.adjustedCost;
			multiplier = adjusted.multiplier;
		}

		if (balance.available >= cost) {
			return { allowed: true, cost, balance: balance.available, multiplier, estimatedTokens };
		}

		return {
			allowed: false,
			cost,
			balance: balance.available,
			shortfall: cost - balance.available,
			multiplier,
			estimatedTokens,
		};
	}

	// ==================== CREDIT ALLOCATION ====================

	/**
	 * Allocate credits to a user (from subscription, top-up, bonus, etc.)
	 */
	async allocateCredits(dto: AllocateCreditsDto): Promise<CreditTransaction> {
		const { userId, amount, transactionType, isExpiring = true } = dto;

		// Get current balance
		const credits = await this.userCreditsRepo.findOrCreate(userId);
		const currentBalance = Number(credits.availableCredits);

		// Add credits
		const { newBalance } = await this.userCreditsRepo.addCredits(userId, amount, isExpiring);

		// Update expiration if provided
		if (dto.expiresAt) {
			await this.userCreditsRepo.updateBalance(userId, newBalance, {
				creditsExpireAt: dto.expiresAt,
			});
		}

		// Create transaction record
		const transaction = await this.transactionRepo.create({
			userId,
			transactionType,
			amount: amount, // Positive for allocation
			balanceBefore: currentBalance,
			balanceAfter: newBalance,
			description: dto.description,
			referenceId: dto.referenceId,
			referenceType: dto.referenceType,
			metadata: dto.metadata,
			expiresAt: dto.expiresAt,
			status: CreditTransactionStatus.COMPLETED,
		});

		this.logger.log(`Allocated ${amount} credits to user ${userId}. New balance: ${newBalance}`);

		// Emit allocation event
		this.eventEmitter.emit('credits.allocated', {
			userId,
			amount,
			transactionType,
			newBalance,
			transaction,
		});

		return transaction;
	}

	/**
	 * Allocate subscription credits when subscription is created or renewed
	 */
	async allocateSubscriptionCredits(
		userId: number,
		creditsAllocation: number,
		subscriptionId: string,
		periodEnd: Date,
		isRenewal: boolean = false,
	): Promise<CreditTransaction> {
		const transactionType = isRenewal
			? CreditTransactionType.SUBSCRIPTION_RENEWAL
			: CreditTransactionType.SUBSCRIPTION_ALLOCATION;

		// If renewal, first expire old credits
		if (isRenewal) {
			await this.expireOldCredits(userId);
		}

		return this.allocateCredits({
			userId,
			amount: creditsAllocation,
			transactionType,
			description: isRenewal
				? `Credit renewal: ${creditsAllocation} credits`
				: `Subscription credit allocation: ${creditsAllocation} credits`,
			referenceId: subscriptionId,
			referenceType: 'user_subscription',
			expiresAt: periodEnd,
			isExpiring: true,
		});
	}

	/**
	 * Allocate signup bonus credits for new users
	 */
	async allocateSignupBonus(userId: number, amount: number = 50): Promise<CreditTransaction> {
		return this.allocateCredits({
			userId,
			amount,
			transactionType: CreditTransactionType.SIGNUP_BONUS,
			description: `Welcome bonus: ${amount} credits`,
			isExpiring: false, // Signup bonus doesn't expire
		});
	}

	// ==================== ADMIN OPERATIONS ====================

	/**
	 * Admin adjustment of user credits
	 */
	async adminAdjustCredits(
		userId: number,
		amount: number,
		reason: string,
		adminUserId: number,
	): Promise<CreditTransaction> {
		const credits = await this.userCreditsRepo.findOrCreate(userId);
		const currentBalance = Number(credits.availableCredits);
		const newBalance = currentBalance + amount;

		if (newBalance < 0) {
			throw new BadRequestException('Cannot adjust credits below zero');
		}

		// Update balance
		await this.userCreditsRepo.updateBalance(userId, newBalance, {
			totalAllocated: amount > 0 ? Number(credits.totalAllocated) + amount : credits.totalAllocated,
			totalConsumed: amount < 0 ? Number(credits.totalConsumed) + Math.abs(amount) : credits.totalConsumed,
		});

		// Create transaction
		const transaction = await this.transactionRepo.create({
			userId,
			transactionType: CreditTransactionType.ADMIN_ADJUSTMENT,
			amount,
			balanceBefore: currentBalance,
			balanceAfter: newBalance,
			description: `Admin adjustment: ${reason}`,
			metadata: { adminUserId, reason },
			status: CreditTransactionStatus.COMPLETED,
		});

		this.logger.log(`Admin ${adminUserId} adjusted credits for user ${userId} by ${amount}. Reason: ${reason}`);

		return transaction;
	}

	/**
	 * Expire credits for a user (called at billing cycle end)
	 */
	async expireOldCredits(userId: number): Promise<CreditTransaction | null> {
		const credits = await this.userCreditsRepo.findByUserId(userId);
		if (!credits || Number(credits.expiringCredits) <= 0) {
			return null;
		}

		const expiringAmount = Number(credits.expiringCredits);
		const currentBalance = Number(credits.availableCredits);
		const newBalance = Math.max(0, currentBalance - expiringAmount);

		// Create expiration transaction
		const transaction = await this.transactionRepo.create({
			userId,
			transactionType: CreditTransactionType.EXPIRATION,
			amount: -expiringAmount,
			balanceBefore: currentBalance,
			balanceAfter: newBalance,
			description: `Credit expiration: ${expiringAmount} credits expired`,
			status: CreditTransactionStatus.COMPLETED,
		});

		// Reset expiring credits
		await this.userCreditsRepo.resetExpiringCredits(userId);

		this.logger.log(`Expired ${expiringAmount} credits for user ${userId}`);

		return transaction;
	}

	// ==================== TRANSACTION HISTORY ====================

	/**
	 * Get user's transaction history
	 */
	async getTransactionHistory(
		userId: number,
		options?: {
			limit?: number;
			offset?: number;
			transactionType?: CreditTransactionType;
		},
	): Promise<{ transactions: CreditTransaction[]; total: number; }> {
		return this.transactionRepo.findByUserId(userId, options);
	}

	/**
	 * Get user's usage summary
	 */
	async getUsageSummary(userId: number, startDate: Date, endDate: Date) {
		return this.transactionRepo.getUserSummary(userId, startDate, endDate);
	}

	/**
	 * Get AI usage breakdown
	 */
	async getAiUsageBreakdown(userId: number, startDate?: Date, endDate?: Date) {
		return this.transactionRepo.getAiUsageBreakdown(userId, startDate, endDate);
	}

	/**
	 * Get daily usage for charts
	 */
	async getDailyUsage(userId: number, days: number = 30) {
		return this.transactionRepo.getDailyUsage(userId, days);
	}

	// ==================== STATISTICS ====================

	/**
	 * Get credit statistics for admin dashboard
	 */
	async getStatistics() {
		const userStats = await this.userCreditsRepo.getStatistics();
		const transactionStats = await this.transactionRepo.getGlobalStatistics();

		return {
			users: userStats,
			transactions: transactionStats,
		};
	}

	// ==================== EVENT HANDLERS ====================

	/**
	 * Handle subscription created event
	 */
	@OnEvent('subscription.created')
	async handleSubscriptionCreated(payload: {
		userId: number;
		subscription: any;
		package: any;
	}) {
		const { userId, subscription, package: pkg } = payload;

		if (pkg.creditsAllocation && pkg.creditsAllocation > 0) {
			await this.allocateSubscriptionCredits(
				userId,
				pkg.creditsAllocation,
				subscription.id.toString(),
				subscription.currentPeriodEnd,
				false,
			);
		}
	}

	/**
	 * Handle subscription renewed event
	 */
	@OnEvent('subscription.renewed')
	async handleSubscriptionRenewed(payload: {
		userId: number;
		subscription: any;
		package: any;
	}) {
		const { userId, subscription, package: pkg } = payload;

		if (pkg.creditsAllocation && pkg.creditsAllocation > 0) {
			await this.allocateSubscriptionCredits(
				userId,
				pkg.creditsAllocation,
				subscription.id.toString(),
				subscription.currentPeriodEnd,
				true,
			);
		}
	}

	/**
	 * Handle subscription cancelled event
	 */
	@OnEvent('subscription.deleted')
	async handleSubscriptionCancelled(payload: { userId: number; subscription: any; }) {
		const { userId, subscription } = payload;

		// Don't expire credits immediately, let them expire at period end
		// This is handled by the creditsExpireAt date
		this.logger.log(`Subscription cancelled for user ${userId}. Credits will expire at period end.`);
	}

	/**
	 * Handle user created event (signup bonus)
	 */
	@OnEvent('user.created')
	async handleUserCreated(payload: { userId: number; }) {
		const { userId } = payload;

		// Allocate signup bonus
		await this.allocateSignupBonus(userId);
	}
}
