import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
	@IsBoolean()
	@IsOptional()
	cancelAtPeriodEnd?: boolean = true;

	@IsString()
	@IsOptional()
	@MaxLength(500)
	cancellationReason?: string;
}
