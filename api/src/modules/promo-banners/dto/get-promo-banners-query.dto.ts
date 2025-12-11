import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetPromoBannersQueryDto {
	@IsOptional()
	@IsString()
	activeOnly?: string;

	@IsOptional()
	@IsString()
	placement?: string;

	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 10;

	@IsOptional()
	@IsString()
	sortBy?: string = 'sortOrder';

	@IsOptional()
	@IsString()
	sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
