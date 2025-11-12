import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class SendChatMessageDto {
	@ApiProperty({ description: 'The chat message content', minLength: 1 })
	@IsString()
	@MinLength(1)
	message: string;

	@ApiPropertyOptional({ description: 'User ID of the question asker' })
	@IsOptional()
	@IsNumber()
	userId?: number;
}