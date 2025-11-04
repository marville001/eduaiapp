import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsDate } from 'class-validator';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;
}