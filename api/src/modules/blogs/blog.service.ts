import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogStatus } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
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

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const slug = createBlogDto.slug || this.generateSlug(createBlogDto.title);

    const existing = await this.blogRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(
        `Blog with slug "${slug}" already exists.`
      );
    }

    const readingTime = createBlogDto.readingTime || this.calculateReadingTime(createBlogDto.content);

    // Set published date if status is published
    const publishedAt = createBlogDto.status === BlogStatus.PUBLISHED ? new Date() : undefined;

    const blog = this.blogRepository.create({
      ...createBlogDto,
      slug,
      readingTime,
      publishedAt
    });

    return this.blogRepository.save(blog);
  }

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find({
      relations: ['category'],
      order: { createdAt: 'DESC' }
    });
  }

  async findPublished(): Promise<Blog[]> {
    return this.blogRepository.findPublished();
  }

  async findScheduled(): Promise<Blog[]> {
    return this.blogRepository.findScheduled();
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findByIdWithRelations(id);

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findBySlugWithRelations(slug);

    if (!blog) {
      throw new NotFoundException(`Blog with slug "${slug}" not found`);
    }

    return blog;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // If updating slug, check for conflicts
    if (updateBlogDto.slug && updateBlogDto.slug !== blog.slug) {
      const existing = await this.blogRepository.findBySlug(updateBlogDto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Blog with slug "${updateBlogDto.slug}" already exists.`
        );
      }
    }

    // Update reading time if content changed
    if (updateBlogDto.content && updateBlogDto.content !== blog.content) {
      updateBlogDto.readingTime = this.calculateReadingTime(updateBlogDto.content);
    }

    // Set published date if status changed to published
    if (updateBlogDto.status === BlogStatus.PUBLISHED && blog.status !== BlogStatus.PUBLISHED) {
      updateBlogDto.publishedAt = new Date();
    }

    Object.assign(blog, updateBlogDto);

    return this.blogRepository.save(blog);
  }

  async remove(id: number): Promise<void> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    await this.blogRepository.remove(blog);
  }

  async incrementViews(id: number): Promise<Blog> {
    const blog = await this.findOne(id);
    blog.views += 1;
    return this.blogRepository.save(blog);
  }

  async incrementLikes(id: number): Promise<Blog> {
    const blog = await this.findOne(id);
    blog.likes += 1;
    return this.blogRepository.save(blog);
  }

  async publishScheduledBlogs(): Promise<void> {
    const scheduledBlogs = await this.blogRepository.find({
      where: {
        status: BlogStatus.SCHEDULED,
        isActive: true
      }
    });

    const now = new Date();
    const blogsToPublish = scheduledBlogs.filter(blog => 
      blog.scheduledAt && blog.scheduledAt <= now
    );

    for (const blog of blogsToPublish) {
      blog.status = BlogStatus.PUBLISHED;
      blog.publishedAt = now;
      await this.blogRepository.save(blog);
    }
  }
}