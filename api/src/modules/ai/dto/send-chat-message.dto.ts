import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class SendChatMessageDto {
	@ApiProperty({ description: 'The chat message content', minLength: 1 })
	@IsString()
	@MinLength(1)
	message: string;

	@ApiPropertyOptional({ description: 'Specific AI model ID to use for this message' })
	@IsOptional()
	@IsNumber()
	aiModelId?: number;
}