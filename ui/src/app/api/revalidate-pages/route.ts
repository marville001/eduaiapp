import { revalidatePath } from 'next/cache';
import { pageApi } from '@/lib/api/page.api';

export const GET = async () => {
  try {
    // Get all published pages
    const pages = await pageApi.getAll('true');
    
    // Revalidate each page
    const revalidationPromises = pages.map(async (page) => {
      try {
        await revalidatePath(`/${page.slug}`);
        return { slug: page.slug, success: true };
      } catch (error) {
        console.error(`Failed to revalidate page /${page.slug}:`, error);
        return { slug: page.slug, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(revalidationPromises);
    
    // Also revalidate the sitemap
    await revalidatePath('/sitemap.xml');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Revalidated ${results.filter(r => r.success).length} of ${results.length} pages`,
      results 
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to revalidate pages:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to revalidate pages', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}