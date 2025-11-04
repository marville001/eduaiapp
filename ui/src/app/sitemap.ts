import { MetadataRoute } from 'next';
import { pageApi } from '@/lib/api/page.api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

  try {
    // Get all published pages
    const pages = await pageApi.getAll('true');
    
    // Generate sitemap entries for pages
    const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Static pages
    const staticEntries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      // Add more static pages as needed
    ];

    return [...staticEntries, ...pageEntries];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    
    // Return basic sitemap if API fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}