import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriptionDto {
	@IsNumber()
	@IsNotEmpty()
	newPackageId: number;

	@IsString()
	@IsOptional()
	promotionCode?: string;
}
