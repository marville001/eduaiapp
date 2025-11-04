import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum, IsNumber, IsArray } from 'class-validator';
import { PageStatus } from '../entities/page.entity';

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
  @IsNotEmpty()
  content: string;

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
}