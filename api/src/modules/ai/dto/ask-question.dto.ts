import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class AskQuestionDto {
	@ApiProperty({ description: 'Subject area for the question' })
	@IsNumber()
	subject: number;

	@ApiProperty({ description: 'The question text', minLength: 10 })
	@IsString()
	@MinLength(10)
	question: string;

	@ApiPropertyOptional({ description: 'Array of file attachment URLs', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	fileAttachments?: string[];

	@ApiPropertyOptional({ description: 'User ID of the question asker' })
	@IsOptional()
	@IsNumber()
	userId: number;
}