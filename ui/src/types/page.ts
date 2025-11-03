
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'subject' | 'general' | 'blog_hub' | 'blog_detail';
  subjectId?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
