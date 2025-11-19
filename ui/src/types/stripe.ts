// Stripe Settings Types
export interface StripeSettings {
	id: number;
	isEnabled: boolean;
	publishableKey?: string;
	secretKeyEncrypted?: string;
	webhookSecretEncrypted?: string;
	allowSubscriptions: boolean;
	trialPeriodDays: number;
	allowCancellation: boolean;
	prorateCharges: boolean;
	currency: string;
	paymentMethods: string[];
	collectTax: boolean;
	taxRatePercentage?: number;
	lastConnectionTestAt?: string;
	lastConnectionSuccessful?: boolean;
	lastConnectionError?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateStripeSettingsDto {
	isEnabled?: boolean;
	publishableKey?: string;
	secretKey?: string;
	webhookSecret?: string;
	allowSubscriptions?: boolean;
	trialPeriodDays?: number;
	allowCancellation?: boolean;
	prorateCharges?: boolean;
	currency?: string;
	paymentMethods?: string[];
	collectTax?: boolean;
	taxRatePercentage?: number;
}

// Subscription Package Types
export enum BillingInterval {
	DAY = 'day',
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
}

export enum PackageType {
	FREE = 'free',
	BASIC = 'basic',
	PREMIUM = 'premium',
	ENTERPRISE = 'enterprise',
	CUSTOM = 'custom',
}

export interface SubscriptionPackage {
	id: number;
	name: string;
	description?: string;
	packageType: PackageType;
	price: number;
	currency: string;
	billingInterval: BillingInterval;
	intervalCount: number;
	stripeProductId?: string;
	stripePriceId?: string;
	features?: string[];
	maxQuestionsPerMonth?: number;
	maxChatsPerMonth?: number;
	maxFileUploads?: number;
	aiModelsAccess?: string[];
	prioritySupport: boolean;
	customBranding: boolean;
	isActive: boolean;
	isVisible: boolean;
	isFeatured: boolean;
	isPopular: boolean;
	trialPeriodDays: number;
	displayOrder: number;
	badgeText?: string;
	badgeColor?: string;
	buttonText: string;
	metadata?: Record<string, string | number | boolean>;
	createdAt: string;
	updatedAt: string;
}

export interface CreateSubscriptionPackageDto {
	name: string;
	description?: string;
	packageType?: PackageType;
	price: number;
	currency?: string;
	billingInterval?: BillingInterval;
	intervalCount?: number;
	stripeProductId?: string;
	stripePriceId?: string;
	features?: string[];
	maxQuestionsPerMonth?: number;
	maxChatsPerMonth?: number;
	maxFileUploads?: number;
	aiModelsAccess?: string[];
	prioritySupport?: boolean;
	customBranding?: boolean;
	isActive?: boolean;
	isVisible?: boolean;
	isFeatured?: boolean;
	isPopular?: boolean;
	trialPeriodDays?: number;
	displayOrder?: number;
	badgeText?: string;
	badgeColor?: string;
	buttonText?: string;
	metadata?: Record<string, string | number | boolean>;
}

export type UpdateSubscriptionPackageDto = Partial<CreateSubscriptionPackageDto>;

export interface PackageStats {
	total: number;
	active: number;
	visible: number;
	featured: number;
}
