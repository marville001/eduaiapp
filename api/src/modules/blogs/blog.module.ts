import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogCategoryService } from './blog-category.service';
import { BlogCategoryController } from './blog-category.controller';
import { BlogRepository } from './blog.repository';
import { BlogCategoryRepository } from './blog-category.repository';

@Module({
  imports: [],
  controllers: [BlogController, BlogCategoryController],
  providers: [BlogService, BlogCategoryService, BlogRepository, BlogCategoryRepository],
  exports: [BlogService, BlogCategoryService]
})
export class BlogModule {}