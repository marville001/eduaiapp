import { pageApi } from '@/lib/api/page.api';
import { subjectApi } from '@/lib/api/subject.api';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published pages and subjects
export async function generateStaticParams() {
  try {
    // Get both pages and subjects
    const [pages, subjects] = await Promise.all([
      pageApi.getAll('true'), // Get only published pages
      subjectApi.getAll(undefined, true) // Get all active subjects
    ]);
    
    const pageParams = pages.map((page) => ({
      slug: page.slug,
    }));
    
    const subjectParams = subjects.map((subject) => ({
      slug: subject.slug,
    }));
    
    return [...pageParams, ...subjectParams];
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    // Try to fetch as page first, then as subject
    let page, subject;
    try {
      page = await pageApi.getBySlug(slug);
      if (!page || page.status !== 'published' || !page.isActive) {
        page = null;
      }
    } catch {
      // Page not found, try subject
    }
    
    if (!page) {
      try {
        subject = await subjectApi.getBySlug(slug);
      } catch {
        // Subject not found either
      }
    }

    if (!page && !subject) {
      return {
        title: 'Content Not Found',
        description: 'The content you are looking for does not exist.',
      };
    }

    // Handle page metadata
    if (page) {
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
    }

    // Handle subject metadata
    if (subject) {
      const title = subject.seoTitle || subject.name;
      const description = subject.seoDescription || `Learn ${subject.name} with MasomoAI's comprehensive course materials and resources.`;
      const imageUrl = subject.seoImage;

      return {
        title,
        description,
        keywords: subject.seoTags?.join(', '),
        authors: [{ name: 'MasomoAI' }],
        creator: 'MasomoAI',
        publisher: 'MasomoAI',
        openGraph: {
          title,
          description,
          type: 'website',
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
    }

    return {
      title: 'Content Not Found',
      description: 'The content you are looking for does not exist.',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Content Not Found',
      description: 'The content you are looking for does not exist.',
    };
  }
}

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
