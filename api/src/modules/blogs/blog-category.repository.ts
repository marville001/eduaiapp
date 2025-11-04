import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BlogCategory } from './entities/blog-category.entity';

@Injectable()
export class BlogCategoryRepository extends Repository<BlogCategory> {
  constructor(private dataSource: DataSource) {
    super(BlogCategory, dataSource.createEntityManager());
  }

  async findBySlug(slug: string): Promise<BlogCategory | null> {
    return this.findOne({
      where: { slug }
    });
  }

  async findByIdWithRelations(id: number): Promise<BlogCategory | null> {
    return this.findOne({
      where: { id },
      relations: ['blogs']
    });
  }

  async findActive(): Promise<BlogCategory[]> {
    return this.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }
}