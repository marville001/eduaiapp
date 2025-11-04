import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { BlogCategoryRepository } from './blog-category.repository';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { BlogCategory } from './entities/blog-category.entity';

@Injectable()
export class BlogCategoryService {
  constructor(
    private readonly blogCategoryRepository: BlogCategoryRepository,
  ) { }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createBlogCategoryDto: CreateBlogCategoryDto): Promise<BlogCategory> {
    const slug = createBlogCategoryDto.slug || this.generateSlug(createBlogCategoryDto.name);

    const existing = await this.blogCategoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(
        `Blog category with slug "${slug}" already exists.`
      );
    }

    const category = this.blogCategoryRepository.create({
      ...createBlogCategoryDto,
      slug
    });

    return this.blogCategoryRepository.save(category);
  }

  async findAll(): Promise<BlogCategory[]> {
    return this.blogCategoryRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findActive(): Promise<BlogCategory[]> {
    return this.blogCategoryRepository.findActive();
  }

  async findOne(id: number): Promise<BlogCategory> {
    const category = await this.blogCategoryRepository.findByIdWithRelations(id);

    if (!category) {
      throw new NotFoundException(`Blog category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<BlogCategory> {
    const category = await this.blogCategoryRepository.findBySlug(slug);

    if (!category) {
      throw new NotFoundException(`Blog category with slug "${slug}" not found`);
    }

    return category;
  }

  async update(id: number, updateBlogCategoryDto: UpdateBlogCategoryDto): Promise<BlogCategory> {
    const category = await this.blogCategoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Blog category with ID ${id} not found`);
    }

    // If updating slug, check for conflicts
    if (updateBlogCategoryDto.slug && updateBlogCategoryDto.slug !== category.slug) {
      const existing = await this.blogCategoryRepository.findBySlug(updateBlogCategoryDto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Blog category with slug "${updateBlogCategoryDto.slug}" already exists.`
        );
      }
    }

    Object.assign(category, updateBlogCategoryDto);

    return this.blogCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.blogCategoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Blog category with ID ${id} not found`);
    }

    await this.blogCategoryRepository.remove(category);
  }
}