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

export class CreatePromoBannerDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(255)
	title: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	imageUrl?: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	buttonText: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	buttonUrl: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	buttonVariant?: string = 'primary';

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = true;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	sortOrder?: number = 0;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	placement?: string = 'ai-tutor';
}
