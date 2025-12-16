"use client";

import { PageSections } from "@/app/(public)/[slug]/components/section-renderer";
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Page, PageSection } from "@/lib/api/page.api";
import Image from "next/image";

interface PagePreviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	page: Partial<Page> & {
		title: string;
		sections?: PageSection[];
	};
}

export function PagePreviewModal({ open, onOpenChange, page }: PagePreviewModalProps) {
	const hasSections = page.sections && page.sections.length > 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl md:min-w-150 lg:min-w-300 xl:min-w-400 w-full h-[90vh] overflow-y-auto p-0">
				<DialogHeader className="sticky top-0 flex justify-between items-center flex-row bg-white z-10 p-4 border-b">

					<DialogTitle className="flex items-center gap-2">
						<span>Page Preview</span>
						<span className="text-sm font-normal text-gray-500">
							(This is how the page will appear to visitors)
						</span>
					</DialogTitle>

					{/* close button */}
					<Button type='button' variant="outline" size="sm" onClick={() => onOpenChange(false)} className="mt-2">
						Close
					</Button>
				</DialogHeader>

				{/* Preview Content - mimics PageView component */}
				<div className="bg-white min-h-full">
					{/* Hero Section */}
					<div className="container mx-auto px-4 py-8 pt-4">
						<div className="max-w-4xl mx-auto text-center text-black">
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
								{page.title || 'Untitled Page'}
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
						<div className="container mx-auto px-4 mt-8 relative z-10">
							<div className="max-w-4xl mx-auto">
								<div className="aspect-video rounded-lg overflow-hidden shadow-2xl relative">
									<Image
										src={page.featuredImage}
										alt={page.title || 'Featured image'}
										fill
										className="object-cover"
									/>
								</div>
							</div>
						</div>
					)}

					{/* Render Sections */}
					{hasSections && (
						<PageSections sections={page.sections!} />
					)}

					{/* Empty State */}
					{!hasSections && !page.featuredImage && !page.excerpt && (
						<div className="container mx-auto px-4 py-16">
							<div className="max-w-4xl mx-auto text-center text-gray-400">
								<p className="text-lg">
									Add content, sections, or a featured image to see how your page will look.
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
