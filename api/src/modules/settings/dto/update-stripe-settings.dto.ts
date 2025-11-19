import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateStripeSettingsDto {
	@IsOptional()
	@IsBoolean()
	isEnabled?: boolean;

	@IsOptional()
	@IsString()
	publishableKey?: string;

	@IsOptional()
	@IsString()
	secretKey?: string;

	@IsOptional()
	@IsString()
	webhookSecret?: string;

	@IsOptional()
	@IsBoolean()
	allowSubscriptions?: boolean;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(365)
	trialPeriodDays?: number;

	@IsOptional()
	@IsBoolean()
	allowCancellation?: boolean;

	@IsOptional()
	@IsBoolean()
	prorateCharges?: boolean;

	@IsOptional()
	@IsString()
	@IsIn(['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'inr', 'chf', 'sgd', 'hkd'])
	currency?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	paymentMethods?: string[];

	@IsOptional()
	@IsBoolean()
	collectTax?: boolean;
}
