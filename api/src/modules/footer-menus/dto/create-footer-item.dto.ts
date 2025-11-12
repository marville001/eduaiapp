import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFooterItemDto {
	@IsString()
	@MaxLength(255)
	title: string;

	@IsString()
	@MaxLength(255)
	@Transform(({ value }) => value.toLowerCase().replace(/\s+/g, '-'))
	slug: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	url?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = true;

	@IsOptional()
	@IsInt()
	@Min(0)
	sortOrder?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	target?: string = '_self';

	@IsOptional()
	@IsString()
	@MaxLength(100)
	icon?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsNumber()
	columnId: number;
}