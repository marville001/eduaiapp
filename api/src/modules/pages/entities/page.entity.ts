import { AbstractEntity } from '@/database/abstract.entity';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum PageSectionType {
  RICH_TEXT = 'rich_text',
  GRID = 'grid',
  CHAT = 'chat',
  HERO = 'hero',
  CTA = 'cta',
  FAQ = 'faq',
  TESTIMONIALS = 'testimonials',
  FEATURES = 'features',
}

export interface GridItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
}

export interface PageSection {
  id: string;
  type: PageSectionType;
  order: number;
  title?: string;
  summary?: string;
  content?: string; // For rich text sections
  gridItems?: GridItem[]; // For grid sections
  gridColumns?: number; // Number of columns for grid (2, 3, 4)
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string; // For CTA sections
  buttonLink?: string; // For CTA sections
  imageUrl?: string; // For hero sections
}

@Entity('pages')
@Index(['id'], { unique: true })
export class Page extends AbstractEntity<Page> {
  @PrimaryGeneratedColumn('uuid', { name: 'page_id' })
  pageId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'json', nullable: true })
  sections?: PageSection[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  featuredImage?: string;

  @Column({ type: 'enum', enum: PageStatus, default: PageStatus.DRAFT })
  status: PageStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  readingTime: number; // in minutes

  // SEO Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle?: string;

  @Column({ type: 'text', nullable: true })
  seoDescription?: string;

  @Column({ type: 'simple-array', nullable: true })
  seoTags?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoImage?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  canonicalUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}