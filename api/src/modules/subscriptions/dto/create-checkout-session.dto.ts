import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
	@IsNumber()
	@IsNotEmpty()
	packageId: number;

	@IsString()
	@IsOptional()
	// @IsUrl()
	successUrl?: string;

	@IsString()
	@IsOptional()
	// @IsUrl()
	cancelUrl?: string;

	@IsString()
	@IsOptional()
	promotionCode?: string;
}
