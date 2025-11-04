import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageApi } from '@/lib/api/page.api';
import { PageView } from './components/page-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published pages
export async function generateStaticParams() {
  try {
    const pages = await pageApi.getAll('true'); // Get only published pages
    
    return pages.map((page) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params for pages:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const page = await pageApi.getBySlug(slug);

    if (!page || page.status !== 'published' || !page.isActive) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      };
    }

    const title = page.seoTitle || page.title;
    const description = page.seoDescription || page.excerpt || `Read ${page.title} on MasomoAI`;
    const imageUrl = page.seoImage || page.featuredImage;

    return {
      title,
      description,
      keywords: page.seoTags?.join(', '),
      authors: [{ name: 'MasomoAI' }],
      creator: 'MasomoAI',
      publisher: 'MasomoAI',
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: page.publishedAt,
        modifiedTime: page.updatedAt,
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ] : [],
        siteName: 'MasomoAI',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
        creator: '@MasomoAI',
      },
      alternates: {
        canonical: `/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata for page:', error);
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  
  let page;
  try {
    page = await pageApi.getBySlug(slug);
  } catch (error) {
    console.error('Failed to fetch page:', error);
    notFound();
  }

  // Check if page exists and is published
  if (!page || page.status !== 'published' || !page.isActive) {
    notFound();
  }

  return <PageView page={page} />;
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static';
export const dynamicParams = true;