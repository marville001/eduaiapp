import { pageApi } from '@/lib/api/page.api';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

interface PageProps {
  params: Promise<{ slug: string; }>;
}

// Generate static params for all published pages and subjects
export async function generateStaticParams() {
  try {
    const pages = await pageApi.getAll('true'); // Get only published pages
    const pageParams = pages.map((page) => ({
      slug: page.slug,
    }));

    return [...pageParams];
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    let page;
    try {
      page = await pageApi.getBySlug(slug);
      if (!page || page.status !== 'published' || !page.isActive) {
        page = null;
      }
    } catch {
      // Page not found
    }

    if (!page) {
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
        canonical: page.canonicalUrl || `https://ai.edutized.com/${page.slug}`,
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
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
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
