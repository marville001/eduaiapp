import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetNavbarMenusDto {
	@ApiPropertyOptional({ description: 'Include only active menus', default: true })
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	activeOnly?: boolean;

	@ApiPropertyOptional({ description: 'Include children menus', default: true })
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	includeChildren?: boolean;

	@ApiPropertyOptional({ description: 'Parent menu ID to filter by' })
	@IsOptional()
	@IsNumber()
	parentId?: number;

	@ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number;

	@ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	limit?: number;

	@ApiPropertyOptional({ description: 'Search term' })
	@IsOptional()
	@IsString()
	search?: string;
}