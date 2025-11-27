import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PageSectionType, PageStatus } from '../entities/page.entity';

export class GridItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class PageSectionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(PageSectionType)
  @IsNotEmpty()
  type: PageSectionType;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridItemDto)
  @IsOptional()
  gridItems?: GridItemDto[];

  @IsNumber()
  @IsOptional()
  gridColumns?: number;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  textColor?: string;

  @IsString()
  @IsOptional()
  buttonText?: string;

  @IsString()
  @IsOptional()
  buttonLink?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageSectionDto)
  @IsOptional()
  sections?: PageSectionDto[];

  @IsString()
  @IsOptional()
  @MaxLength(500)
  featuredImage?: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  @IsNumber()
  @IsOptional()
  readingTime?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  seoTags?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(500)
  seoImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  canonicalUrl?: string;
}