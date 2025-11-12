import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateNavbarMenuDto {
	@ApiProperty({ description: 'Menu title' })
	@IsString()
	@MaxLength(255)
	title: string;

	@ApiProperty({ description: 'Menu slug (URL-friendly identifier)' })
	@IsString()
	@MaxLength(255)
	slug: string;

	@ApiPropertyOptional({ description: 'Menu URL/link' })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	url?: string;

	@ApiPropertyOptional({ description: 'Parent menu ID for nested menus', default: null })
	@IsOptional()
	@IsNumber()
	parentId?: number;

	@ApiPropertyOptional({ description: 'Menu active status', default: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({ description: 'Sort order', default: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	sortOrder?: number;

	@ApiPropertyOptional({ description: 'Link target', default: '_self' })
	@IsOptional()
	@IsString()
	@IsIn(['_self', '_blank', '_parent', '_top'])
	target?: string;

	@ApiPropertyOptional({ description: 'Menu icon class/name' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	icon?: string;

	@ApiPropertyOptional({ description: 'Menu description' })
	@IsOptional()
	@IsString()
	description?: string;
}