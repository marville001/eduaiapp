"use client";

import { Page, pageApi } from '@/lib/api/page.api';
import Image from 'next/image';
import { useEffect } from 'react';
import { PageSections } from './section-renderer';

interface PageViewProps {
	page: Page;
}

export function PageView({ page }: PageViewProps) {
	// Increment view count when page is viewed
	useEffect(() => {
		const incrementViews = async () => {
			try {
				await pageApi.incrementViews(page.id.toString());
			} catch (error) {
				console.error('Failed to increment page views:', error);
			}
		};

		if (page.id) incrementViews();
	}, [page.id]);

	const hasSections = page.sections && page.sections.length > 0;

	return (
		<div className="min-h-screen bg-white z-1225 py-16">
			{/* Hero Section - Only show if no sections or as header */}

			<div className="container mx-auto px-4 py-8 pt-0">
				<div className="max-w-4xl mx-auto text-center text-black">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
						{page.title}
					</h1>

					{page.excerpt && (
						<p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
							{page.excerpt}
						</p>
					)}
				</div>
			</div>

			{/* Featured Image */}
			{page.featuredImage && (
				<div className="container mx-auto px-4 mt-16 relative z-10">
					<div className="max-w-4xl mx-auto">
						<div className="aspect-video rounded-lg overflow-hidden shadow-2xl relative">
							<Image
								src={page.featuredImage}
								alt={page.title}
								fill
								className="object-cover"
								priority
							/>
						</div>
					</div>
				</div>
			)}

			{/* Render Sections */}
			{hasSections && (
				<PageSections sections={page.sections!} />
			)}

			{/* Page Footer */}
			{/* <div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="p-6 bg-white rounded-lg shadow-lg">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<span className="text-sm font-medium text-gray-500">
									Last updated: <span className="font-semibold text-lg">{formatDate(page.updatedAt)}</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div> */}

			{/* Structured Data for SEO */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						"headline": page.title,
						"description": page.excerpt || page.seoDescription,
						"author": {
							"@type": "Organization",
							"name": "MasomoAI"
						},
						"publisher": {
							"@type": "Organization",
							"name": "MasomoAI"
						},
						"datePublished": page.publishedAt,
						"dateModified": page.updatedAt,
						"image": page.featuredImage || page.seoImage,
						"url": `https://yourdomain.com/${page.slug}`,
						"mainEntityOfPage": {
							"@type": "WebPage",
							"@id": `https://yourdomain.com/${page.slug}`
						}
					})
				}}
			/>
		</div>
	);
}