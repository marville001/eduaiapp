# Dynamic Pages System

## Overview
This system creates SEO-optimized static pages that are generated at build time and revalidated when admin creates or edits pages.

## Files Created

### 1. `/app/(public)/[slug]/page.tsx`
- **Purpose**: Dynamic page route that matches any slug
- **Features**:
  - SSG with ISR (revalidates every hour)
  - SEO metadata generation
  - Static params generation for all published pages
  - 404 handling for unpublished/deleted pages

### 2. `/app/(public)/[slug]/components/page-view.tsx`
- **Purpose**: Client component that renders the page content
- **Features**:
  - Responsive design with hero section
  - View count increment
  - Structured data for SEO
  - Featured image optimization with Next.js Image
  - Reading time and publish date display

### 3. `/app/(public)/[slug]/not-found.tsx`
- **Purpose**: Custom 404 page for invalid slugs
- **Features**:
  - Clean design with navigation options
  - User-friendly error message

### 4. `/app/sitemap.ts`
- **Purpose**: Dynamic sitemap generation
- **Features**:
  - Includes all published pages
  - Proper last modified dates
  - SEO-friendly priority settings

### 5. `/app/robots.ts`
- **Purpose**: Robots.txt file for search engines
- **Features**:
  - Allows crawling of public pages
  - Blocks admin and API routes
  - References sitemap

### 6. `/app/api/revalidate-pages/route.ts`
- **Purpose**: Bulk revalidation endpoint
- **Features**:
  - Revalidates all published pages
  - Error handling and reporting
  - Sitemap revalidation

## Revalidation System

### Automatic Revalidation
The system automatically revalidates pages when:
- Admin creates a new published page
- Admin updates an existing page
- Admin deletes a page
- Admin changes page status (publish/unpublish)

### Manual Revalidation
- Single page: `GET /api/revalidate/[slug]`
- All pages: `GET /api/revalidate-pages`

## SEO Features

### Metadata
- Dynamic title and description from page SEO fields
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs
- Structured data (JSON-LD)

### Performance
- Static generation at build time
- Incremental Static Regeneration (ISR)
- Image optimization with Next.js Image
- Fast loading with optimized assets

### Search Engine Optimization
- Proper heading structure
- Meta tags and descriptions
- Sitemap inclusion
- Robots.txt configuration
- Schema.org structured data

## Usage

### Creating Pages
1. Admin creates page in `/admin/pages/new`
2. Set status to "published" and isActive to true
3. Page is automatically available at `/{slug}`
4. Revalidation is triggered automatically

### Page Structure
```
/{slug}
├── Hero section with title and excerpt
├── Featured image (if provided)
├── Main content with rich formatting
├── Meta information (views, reading time, dates)
└── Structured data for SEO
```

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`: Base URL for sitemap and canonical URLs

## API Endpoints Used
- `pageApi.getAll('true')`: Get published pages
- `pageApi.getBySlug(slug)`: Get specific page
- `pageApi.incrementViews(id)`: Track page views