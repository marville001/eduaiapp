import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PageRepository } from './page.repository';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page, PageStatus } from './entities/page.entity';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository,
  ) { }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const slug = createPageDto.slug || this.generateSlug(createPageDto.title);

    const existing = await this.pageRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(
        `Page with slug "${slug}" already exists.`
      );
    }

    const readingTime = createPageDto.readingTime || this.calculateReadingTime(createPageDto.content);

    // Set published date if status is published
    const publishedAt = createPageDto.status === PageStatus.PUBLISHED ? new Date() : undefined;

    const page = this.pageRepository.create({
      ...createPageDto,
      slug,
      readingTime,
      publishedAt
    });

    return this.pageRepository.save(page);
  }

  async findAll(): Promise<Page[]> {
    return this.pageRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findPublished(): Promise<Page[]> {
    return this.pageRepository.findPublished();
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findByIdWithRelations(id);

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return page;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageRepository.findBySlugWithRelations(slug);

    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    // If updating slug, check for conflicts
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existing = await this.pageRepository.findBySlug(updatePageDto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Page with slug "${updatePageDto.slug}" already exists.`
        );
      }
    }

    // Update reading time if content changed
    if (updatePageDto.content && updatePageDto.content !== page.content) {
      updatePageDto.readingTime = this.calculateReadingTime(updatePageDto.content);
    }

    // Set published date if status changed to published
    if (updatePageDto.status === PageStatus.PUBLISHED && page.status !== PageStatus.PUBLISHED) {
      updatePageDto.publishedAt = new Date();
    }

    Object.assign(page, updatePageDto);

    return this.pageRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.pageRepository.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    await this.pageRepository.remove(page);
  }

  async incrementViews(id: number): Promise<Page> {
    const page = await this.findOne(id);
    page.views += 1;
    return this.pageRepository.save(page);
  }
}