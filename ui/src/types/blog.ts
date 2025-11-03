

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isPinned: boolean;
  authorId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}