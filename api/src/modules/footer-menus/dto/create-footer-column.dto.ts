import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFooterColumnDto {
	@IsString()
	@MaxLength(255)
	title: string;

	@IsString()
	@MaxLength(255)
	@Transform(({ value }) => value.toLowerCase().replace(/\s+/g, '-'))
	slug: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = true;

	@IsOptional()
	@IsInt()
	@Min(0)
	sortOrder?: number;

	@IsOptional()
	@IsString()
	description?: string;
}