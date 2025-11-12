import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetFooterItemsDto {
	@IsOptional()
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
	@IsInt()
	columnId?: number;

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