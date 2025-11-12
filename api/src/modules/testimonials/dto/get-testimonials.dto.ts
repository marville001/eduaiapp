import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetTestimonialsDto {
	@IsOptional()
	@IsString()
	activeOnly?: string = "false";

	@IsOptional()
	@Type(() => Boolean)
	@Transform(({ value }) => {
		if (value === 'true') return true;
		if (value === 'false') return false;
		return value;
	})
	@IsBoolean()
	featuredOnly?: boolean;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;

	@IsOptional()
	@IsString()
	search?: string;
}