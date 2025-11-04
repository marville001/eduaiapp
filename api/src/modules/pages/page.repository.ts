import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Page, PageStatus } from './entities/page.entity';

@Injectable()
export class PageRepository extends Repository<Page> {
  constructor(private dataSource: DataSource) {
    super(Page, dataSource.createEntityManager());
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.findOne({
      where: { slug }
    });
  }

  async findByIdWithRelations(id: number): Promise<Page | null> {
    return this.findOne({
      where: { id }
    });
  }

  async findBySlugWithRelations(slug: string): Promise<Page | null> {
    return this.findOne({
      where: { slug }
    });
  }

  async findPublished(): Promise<Page[]> {
    return this.find({
      where: { 
        isActive: true,
        status: PageStatus.PUBLISHED
      },
      order: { publishedAt: 'DESC' }
    });
  }
}