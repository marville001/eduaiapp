import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import { CreditTransactionType } from '../entities/credit-transaction.entity';

export class ConsumeCreditsDto {
	@IsEnum(CreditTransactionType)
	transactionType: CreditTransactionType;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	amount?: number;

	@IsString()
	@MaxLength(500)
	description: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	referenceId?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	referenceType?: string;

	@IsOptional()
	metadata?: Record<string, any>;
}

export class AllocateCreditsDto {
	@IsInt()
	@IsPositive()
	userId: number;

	@IsNumber()
	@IsPositive()
	amount: number;

	@IsEnum(CreditTransactionType)
	transactionType: CreditTransactionType;

	@IsString()
	@MaxLength(500)
	description: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	referenceId?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	referenceType?: string;

	@IsOptional()
	metadata?: Record<string, any>;
}

export class AdminAdjustCreditsDto {
	@IsInt()
	@IsPositive()
	userId: number;

	@IsNumber()
	amount: number; // Can be positive or negative

	@IsString()
	@MaxLength(500)
	reason: string;
}

export class GetTransactionHistoryDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	limit?: number = 50;

	@IsOptional()
	@IsInt()
	@Min(0)
	offset?: number = 0;

	@IsOptional()
	@IsEnum(CreditTransactionType)
	transactionType?: CreditTransactionType;
}

export class UpdateCreditThresholdDto {
	@IsInt()
	@Min(0)
	threshold: number;
}
