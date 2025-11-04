import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsDate } from 'class-validator';
import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;
}