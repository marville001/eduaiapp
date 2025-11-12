import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

export class CreateTestimonialDto {
	@IsString()
	@MaxLength(255)
	customerName: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	customerTitle?: string;

	@IsOptional()
	@IsEmail()
	customerEmail?: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	customerCompany?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	customerImage?: string;

	@IsString()
	content: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number = 5;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = true;

	@IsOptional()
	@IsBoolean()
	isFeatured?: boolean = false;

	@IsOptional()
	@IsInt()
	@Min(0)
	sortOrder?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	category?: string = 'general';

	@IsOptional()
	@IsDate()
	@Transform(({ value }) => value ? new Date(value) : null)
	testimonialDate?: Date;

	@IsOptional()
	@IsUrl()
	videoUrl?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	sourceUrl?: string;
}