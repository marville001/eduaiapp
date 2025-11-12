import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetFooterColumnsDto {
	@IsOptional()
	@Transform(({ value }) => {
		console.log({ value });

		if (value === 'true') return true;
		if (value === 'false') return false;
		return value;
	})
	@IsString()
	activeOnly?: string = 'false';

	@IsOptional()
	@Type(() => Boolean)
	@Transform(({ value }) => {
		if (value === 'true') return true;
		if (value === 'false') return false;
		return value;
	})
	@IsBoolean()
	includeItems?: boolean = true;

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