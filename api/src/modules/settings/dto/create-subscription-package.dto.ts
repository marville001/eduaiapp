import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { BillingInterval, PackageType } from '../entities/subscription-package.entity';

export class CreateSubscriptionPackageDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(PackageType)
	packageType?: PackageType;

	@IsNotEmpty()
	@IsNumber()
	price: number;

	@IsOptional()
	@IsString()
	@MaxLength(3)
	currency?: string;

	@IsOptional()
	@IsEnum(BillingInterval)
	billingInterval?: BillingInterval;

	@IsOptional()
	@IsInt()
	@Min(1)
	intervalCount?: number;

	@IsOptional()
	@IsString()
	stripeProductId?: string;

	@IsOptional()
	@IsString()
	stripePriceId?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	features?: string[];

	@IsOptional()
	@IsInt()
	@Min(-1)
	maxQuestionsPerMonth?: number;

	@IsOptional()
	@IsInt()
	@Min(-1)
	maxChatsPerMonth?: number;

	@IsOptional()
	@IsInt()
	@Min(-1)
	maxFileUploads?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	aiModelsAccess?: string[];

	@IsOptional()
	@IsBoolean()
	prioritySupport?: boolean;

	@IsOptional()
	@IsBoolean()
	customBranding?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsBoolean()
	isVisible?: boolean;

	@IsOptional()
	@IsBoolean()
	isFeatured?: boolean;

	@IsOptional()
	@IsBoolean()
	isPopular?: boolean;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(365)
	trialPeriodDays?: number;

	// Credit Settings
	@IsOptional()
	@IsInt()
	@Min(-1) // -1 = unlimited
	creditsAllocation?: number; // Credits given per billing cycle

	@IsOptional()
	@IsNumber()
	@Min(0.01)
	@Max(10)
	creditMultiplier?: number; // Multiplier for credit costs (1.0 = normal)

	@IsOptional()
	@IsInt()
	@Min(0)
	displayOrder?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	badgeText?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	badgeColor?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	buttonText?: string;

	@IsOptional()
	metadata?: Record<string, any>;
}
