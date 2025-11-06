"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { Page } from '@/lib/api/page.api';
import { pageApi } from '@/lib/api/page.api';
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

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="container mx-auto px-4 py-16">
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
				<div className="container mx-auto px-4 -mt-16 relative z-10">
					<div className="max-w-4xl mx-auto">
						<div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
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

			{/* Main Content */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					<article
						className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-li:text-gray-700
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4
                prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:text-gray-100
                prose-img:rounded-lg prose-img:shadow-lg"
						dangerouslySetInnerHTML={{ __html: page.content }}
					/>

					{/* Page Footer */}
					<div className="mt-12 p-6 bg-white rounded-lg shadow-lg">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<span className="text-sm font-medium text-gray-500">
									Last updated: <span className="font-semibold text-lg">{formatDate(page.updatedAt)}</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

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