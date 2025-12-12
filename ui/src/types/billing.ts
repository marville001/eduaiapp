// Credit Transaction Types
export enum CreditTransactionType {
	// Inbound
	SUBSCRIPTION_ALLOCATION = 'subscription_allocation',
	SUBSCRIPTION_RENEWAL = 'subscription_renewal',
	TOP_UP_PURCHASE = 'top_up_purchase',
	PROMOTIONAL = 'promotional',
	REFUND = 'refund',
	ADMIN_ADJUSTMENT = 'admin_adjustment',
	SIGNUP_BONUS = 'signup_bonus',
	REFERRAL_BONUS = 'referral_bonus',

	// Outbound
	AI_QUESTION = 'ai_question',
	AI_CHAT_MESSAGE = 'ai_chat_message',
	AI_DOCUMENT_ANALYSIS = 'ai_document_analysis',
	AI_IMAGE_GENERATION = 'ai_image_generation',
	AI_ADVANCED_MODEL = 'ai_advanced_model',
	FEATURE_USAGE = 'feature_usage',

	// System
	EXPIRATION = 'expiration',
	SUBSCRIPTION_DOWNGRADE = 'subscription_downgrade',
	SUBSCRIPTION_CANCELLATION = 'subscription_cancellation',
}

export enum CreditTransactionStatus {
	PENDING = 'pending',
	COMPLETED = 'completed',
	FAILED = 'failed',
	REVERSED = 'reversed',
}

// Credit Balance Response
export interface CreditBalance {
	available: number;
	expiring: number;
	purchased: number;
	totalConsumed: number;
	totalAllocated: number;
	expiresAt?: string;
	isLowOnCredits: boolean;
}

// Credit Transaction (Ledger Entry)
export interface CreditTransaction {
	id: number;
	userId: number;
	transactionType: CreditTransactionType;
	amount: number;
	balanceAfter: number;
	balanceBefore: number;
	status: CreditTransactionStatus;
	description: string;
	referenceId?: string;
	referenceType?: string;
	metadata?: Record<string, unknown>;
	expiresAt?: string;
	createdAt: string;
	updatedAt: string;
}

// Usage Summary
export interface CreditUsageSummary {
	totalCredits: number;
	totalDebits: number;
	netChange: number;
	transactionCount: number;
	byType: Record<CreditTransactionType, number>;
}

// AI Usage Breakdown
export interface AiUsageBreakdown {
	questions: number;
	chatMessages: number;
	documentAnalysis: number;
	imageGeneration: number;
	advancedModel: number;
	total: number;
}

// Daily Usage Data
export interface DailyUsage {
	date: string;
	credits: number;
	transactions: number;
}

// Transaction History Response
export interface TransactionHistoryResponse {
	success: boolean;
	data: CreditTransaction[];
	meta: {
		total: number;
		limit: number;
		offset: number;
	};
}

// Credit Statistics (Admin)
export interface CreditStatistics {
	users: {
		totalUsers: number;
		totalCreditsInCirculation: number;
		totalCreditsConsumed: number;
		averageCreditsPerUser: number;
	};
	transactions: {
		totalTransactions: number;
		totalCreditsAllocated: number;
		totalCreditsConsumed: number;
		topTransactionTypes: Array<{
			type: CreditTransactionType;
			count: number;
			amount: number;
		}>;
	};
}

// Helper function to get transaction type display name
export const getTransactionTypeLabel = (type: CreditTransactionType): string => {
	const labels: Record<CreditTransactionType, string> = {
		[CreditTransactionType.SUBSCRIPTION_ALLOCATION]: 'Subscription Credits',
		[CreditTransactionType.SUBSCRIPTION_RENEWAL]: 'Subscription Renewal',
		[CreditTransactionType.TOP_UP_PURCHASE]: 'Credit Top-up',
		[CreditTransactionType.PROMOTIONAL]: 'Promotional Credits',
		[CreditTransactionType.REFUND]: 'Refund',
		[CreditTransactionType.ADMIN_ADJUSTMENT]: 'Admin Adjustment',
		[CreditTransactionType.SIGNUP_BONUS]: 'Welcome Bonus',
		[CreditTransactionType.REFERRAL_BONUS]: 'Referral Bonus',
		[CreditTransactionType.AI_QUESTION]: 'AI Question',
		[CreditTransactionType.AI_CHAT_MESSAGE]: 'AI Chat',
		[CreditTransactionType.AI_DOCUMENT_ANALYSIS]: 'Document Analysis',
		[CreditTransactionType.AI_IMAGE_GENERATION]: 'Image Generation',
		[CreditTransactionType.AI_ADVANCED_MODEL]: 'Advanced AI Model',
		[CreditTransactionType.FEATURE_USAGE]: 'Feature Usage',
		[CreditTransactionType.EXPIRATION]: 'Credits Expired',
		[CreditTransactionType.SUBSCRIPTION_DOWNGRADE]: 'Subscription Downgrade',
		[CreditTransactionType.SUBSCRIPTION_CANCELLATION]: 'Subscription Cancelled',
	};
	return labels[type] || type;
};

// Helper function to check if transaction is credit (positive)
export const isCredit = (transaction: CreditTransaction): boolean => {
	return transaction.amount > 0;
};

// Helper function to format credits
export const formatCredits = (credits: number): string => {
	return new Intl.NumberFormat().format(Math.abs(credits));
};

// Helper function to format price (accepts decimal price, e.g., 9.99)
export const formatPrice = (price: number, currency: string = 'usd'): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase(),
	}).format(price);
};
