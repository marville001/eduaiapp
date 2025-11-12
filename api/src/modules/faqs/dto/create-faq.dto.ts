import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	Min
} from 'class-validator';

export class CreateFaqDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	question: string;

	@IsNotEmpty()
	@IsString()
	answer: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = true;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	sortOrder?: number = 0;

}
