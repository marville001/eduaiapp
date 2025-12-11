import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
	Min
} from 'class-validator';

export class UpdatePromoBannerDto {
	@IsOptional()
	@IsString()
	@MaxLength(255)
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	imageUrl?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	buttonText?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	buttonUrl?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	buttonVariant?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	sortOrder?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	placement?: string;
}
