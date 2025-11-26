import { subjectApi } from '@/lib/api/subject.api';
import { notFound } from 'next/navigation';
import SubjectView from './components/subject-view';

interface PageProps {
  params: Promise<{ slug: string; }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  // Try to fetch as page first, then as subject
  let subject;
  try {
    subject = await subjectApi.getBySlug(slug);
  } catch {
    // Subject not found either
  }

  // If neither page nor subject found, show 404
  if (!subject) {
    notFound();
  }

  return <SubjectView subject={subject} />;
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static';
export const dynamicParams = true;