import { notFound } from 'next/navigation';
import { pageApi } from '@/lib/api/page.api';
import { subjectApi } from '@/lib/api/subject.api';
import { PageView } from './components/page-view';
import SubjectView from './components/subject-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  
  // Try to fetch as page first, then as subject
  let page, subject;
  try {
    page = await pageApi.getBySlug(slug);
    // Check if page exists and is published
    if (!page || page.status !== 'published' || !page.isActive) {
      page = null;
    }
  } catch {
    // Page not found, will try subject
  }

  if (!page) {
    try {
      subject = await subjectApi.getBySlug(slug);
    } catch {
      // Subject not found either
    }
  }

  // If neither page nor subject found, show 404
  if (!page && !subject) {
    notFound();
  }

  // Render page content
  if (page) {
    return <PageView page={page} />;
  }

  // Render subject content
  if (subject) {
    return <SubjectView subject={subject} />;
  }

  // Fallback (shouldn't reach here)
  notFound();
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static';
export const dynamicParams = true;