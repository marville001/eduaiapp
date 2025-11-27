import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  parentSubjectId?: number;

  @IsString()
  @IsOptional()
  aiPrompt?: string;

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
