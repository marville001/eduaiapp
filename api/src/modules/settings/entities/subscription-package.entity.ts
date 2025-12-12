import { AbstractEntity } from '@/database/abstract.entity';
import { Column, Entity, Index } from 'typeorm';

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

@Entity('subscription_packages')
@Index(['id'], { unique: true })
export class SubscriptionPackage extends AbstractEntity<SubscriptionPackage> {
	// Package Information
	@Column({ name: 'name', type: 'varchar', length: 100 })
	name: string;

	@Column({ name: 'description', type: 'text', nullable: true })
	description?: string;

	@Column({ name: 'package_type', type: 'enum', enum: PackageType, default: PackageType.CUSTOM })
	packageType: PackageType;

	// Pricing Information
	@Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
	price: number;

	@Column({ name: 'currency', type: 'varchar', length: 3, default: 'usd' })
	currency: string;

	@Column({ name: 'billing_interval', type: 'enum', enum: BillingInterval, default: BillingInterval.MONTH })
	billingInterval: BillingInterval;

	@Column({ name: 'interval_count', type: 'integer', default: 1 })
	intervalCount: number;

	// Stripe Integration
	@Column({ name: 'stripe_product_id', type: 'varchar', length: 255, nullable: true })
	stripeProductId?: string;

	@Column({ name: 'stripe_price_id', type: 'varchar', length: 255, nullable: true, unique: true })
	stripePriceId?: string;

	// Package Features
	@Column({ name: 'features', type: 'simple-json', nullable: true })
	features?: string[];

	@Column({ name: 'max_questions_per_month', type: 'integer', nullable: true })
	maxQuestionsPerMonth?: number;

	@Column({ name: 'max_chats_per_month', type: 'integer', nullable: true })
	maxChatsPerMonth?: number;

	@Column({ name: 'max_file_uploads', type: 'integer', nullable: true })
	maxFileUploads?: number;

	@Column({ name: 'ai_models_access', type: 'simple-array', nullable: true })
	aiModelsAccess?: string[];

	@Column({ name: 'priority_support', type: 'boolean', default: false })
	prioritySupport: boolean;

	@Column({ name: 'custom_branding', type: 'boolean', default: false })
	customBranding: boolean;

	// Status and Visibility
	@Column({ name: 'is_active', type: 'boolean', default: true })
	isActive: boolean;

	@Column({ name: 'is_visible', type: 'boolean', default: true })
	isVisible: boolean;

	@Column({ name: 'is_featured', type: 'boolean', default: false })
	isFeatured: boolean;

	@Column({ name: 'is_popular', type: 'boolean', default: false })
	isPopular: boolean;

	// Trial Settings
	@Column({ name: 'trial_period_days', type: 'integer', default: 0 })
	trialPeriodDays: number;

	// Credit Settings
	@Column({ name: 'credits_allocation', type: 'integer', default: 0 })
	creditsAllocation: number; // Credits given per billing cycle

	@Column({ name: 'credit_multiplier', type: 'decimal', precision: 3, scale: 2, default: 1.00 })
	creditMultiplier: number;

	// Display Settings
	@Column({ name: 'display_order', type: 'integer', default: 0 })
	displayOrder: number;

	@Column({ name: 'badge_text', type: 'varchar', length: 50, nullable: true })
	badgeText?: string;

	@Column({ name: 'badge_color', type: 'varchar', length: 50, nullable: true })
	badgeColor?: string;

	@Column({ name: 'button_text', type: 'varchar', length: 50, default: 'Subscribe' })
	buttonText: string;

	// Metadata
	@Column({ name: 'metadata', type: 'simple-json', nullable: true })
	metadata?: Record<string, any>;

	// Helper methods
	getFormattedPrice(): string {
		const symbol = this.getCurrencySymbol();
		return `${symbol}${this.price.toFixed(2)}`;
	}

	getCurrencySymbol(): string {
		const symbols: Record<string, string> = {
			usd: '$',
			eur: '€',
			gbp: '£',
			jpy: '¥',
			cad: 'CA$',
			aud: 'AU$',
		};
		return symbols[this.currency.toLowerCase()] || this.currency.toUpperCase();
	}

	getBillingPeriod(): string {
		if (this.intervalCount === 1) {
			return `per ${this.billingInterval}`;
		}
		return `per ${this.intervalCount} ${this.billingInterval}s`;
	}

	getFullPriceDisplay(): string {
		return `${this.getFormattedPrice()} ${this.getBillingPeriod()}`;
	}

	isConfiguredWithStripe(): boolean {
		return !!this.stripeProductId && !!this.stripePriceId;
	}

	isFree(): boolean {
		return this.price === 0 || this.packageType === PackageType.FREE;
	}

	hasUnlimitedQuestions(): boolean {
		return this.maxQuestionsPerMonth === null || this.maxQuestionsPerMonth === -1;
	}

	hasUnlimitedChats(): boolean {
		return this.maxChatsPerMonth === null || this.maxChatsPerMonth === -1;
	}

	canAccessAiModel(modelName: string): boolean {
		if (!this.aiModelsAccess || this.aiModelsAccess.length === 0) return true;
		return this.aiModelsAccess.includes(modelName) || this.aiModelsAccess.includes('*');
	}

	hasUnlimitedCredits(): boolean {
		return this.creditsAllocation === -1;
	}
}
