import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetFaqsQueryDto {
	@IsOptional()
	@IsString()
	activeOnly?: string = "false";

	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	limit?: number = 10;

	@IsOptional()
	@IsString()
	sortBy?: string = 'sortOrder';

	@IsOptional()
	@IsString()
	sortOrder?: 'ASC' | 'DESC' = 'ASC';
}