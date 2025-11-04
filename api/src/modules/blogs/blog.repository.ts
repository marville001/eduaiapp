import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';

@Injectable()
export class BlogRepository extends Repository<Blog> {
  constructor(private dataSource: DataSource) {
    super(Blog, dataSource.createEntityManager());
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    return this.findOne({
      where: { slug },
      relations: ['category']
    });
  }

  async findByIdWithRelations(id: number): Promise<Blog | null> {
    return this.findOne({
      where: { id },
      relations: ['category']
    });
  }

  async findBySlugWithRelations(slug: string): Promise<Blog | null> {
    return this.findOne({
      where: { slug },
      relations: ['category']
    });
  }

  async findPublished(): Promise<Blog[]> {
    return this.find({
      where: { 
        isActive: true,
        status: BlogStatus.PUBLISHED
      },
      relations: ['category'],
      order: { publishedAt: 'DESC' }
    });
  }

  async findScheduled(): Promise<Blog[]> {
    return this.find({
      where: { 
        isActive: true,
        status: BlogStatus.SCHEDULED
      },
      relations: ['category'],
      order: { scheduledAt: 'ASC' }
    });
  }
}