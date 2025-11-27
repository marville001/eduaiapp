"use client";

import AiChatForm from '@/components/forms/ai-chat-form';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { GridItem, PageSection, PageSectionType } from "@/lib/api/page.api";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// Rich Text Section
function RichTextSection({ section }: { section: PageSection; }) {
	return (
		<section className="py-12">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					{section.title && (
						<h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-lg text-gray-600 mb-8 text-center">
							{section.summary}
						</p>
					)}
					{section.content && (
						<div
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
							dangerouslySetInnerHTML={{ __html: section.content }}
						/>
					)}
				</div>
			</div>
		</section>
	);
}

// Grid Section
function GridSection({ section }: { section: PageSection; }) {
	const columns = section.gridColumns || 3;
	const gridCols = {
		2: "md:grid-cols-2",
		3: "md:grid-cols-3",
		4: "md:grid-cols-4",
	}[columns] || "md:grid-cols-3";

	return (
		<section className="py-16 ">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					{section.title && (
						<h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
							{section.summary}
						</p>
					)}
					<div className={cn("grid gap-8", gridCols)}>
						{section.gridItems?.map((item: GridItem) => (
							<div
								key={item.id}
								className="bg-white rounded-sm p-6 shadow-sm hover:shadow transition-shadow"
							>
								{item.icon && (
									<div className="w-16 h-16 mb-4 relative">
										<Image
											src={item.icon}
											alt={item.title}
											fill
											className="object-contain"
										/>
									</div>
								)}
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{item.title}
								</h3>
								<div
									className="text-gray-600 prose prose-sm"
									dangerouslySetInnerHTML={{ __html: item.description }}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

// Chat Section - Placeholder for AI chat
function ChatSection({ section }: { section: PageSection; }) {
	return (
		<section className="py-16 bg-neutral-100 ">
			<div className="container mx-auto px-4">
				<div className="max-w-2xl mx-auto text-center">
					{section.title && (
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-lg text-gray-600 mb-8">{section.summary}</p>
					)}
					<AiChatForm />
				</div>
			</div>
		</section>
	);
}

// Hero Section
function HeroSection({ section }: { section: PageSection; }) {
	const bgColor = section.backgroundColor || "#1a1a2e";
	const textColor = section.textColor || "#ffffff";

	return (
		<section
			className="py-20 relative overflow-hidden"
			style={{ backgroundColor: bgColor, color: textColor }}
		>
			{section.imageUrl && (
				<div className="absolute inset-0 z-0">
					<Image
						src={section.imageUrl}
						alt={section.title || "Hero background"}
						fill
						className="object-cover opacity-30"
					/>
				</div>
			)}
			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-4xl mx-auto text-center">
					{section.title && (
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
							{section.title}
						</h1>
					)}
					{section.summary && (
						<p className="text-xl md:text-2xl opacity-90 mb-8">
							{section.summary}
						</p>
					)}
					{section.content && (
						<div
							className="prose prose-lg prose-invert max-w-none mb-8"
							dangerouslySetInnerHTML={{ __html: section.content }}
						/>
					)}
					{section.buttonText && section.buttonLink && (
						<Link href={section.buttonLink}>
							<Button
								size="lg"
								className="bg-white text-gray-900 hover:bg-gray-100"
							>
								{section.buttonText}
							</Button>
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}

// CTA Section
function CtaSection({ section }: { section: PageSection; }) {
	const bgColor = section.backgroundColor || "#6366f1";
	const textColor = section.textColor || "#ffffff";

	return (
		<section
			className="py-16"
			style={{ backgroundColor: bgColor, color: textColor }}
		>
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center">
					{section.title && (
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-xl opacity-90 mb-6">{section.summary}</p>
					)}
					{section.content && (
						<div
							className="prose prose-lg prose-invert max-w-none mb-8 opacity-90"
							dangerouslySetInnerHTML={{ __html: section.content }}
						/>
					)}
					{section.buttonText && section.buttonLink && (
						<Link href={section.buttonLink}>
							<Button
								size="lg"
								className="bg-white text-gray-900 hover:bg-gray-100"
							>
								{section.buttonText}
							</Button>
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}

// FAQ Section
function FaqSection({ section }: { section: PageSection; }) {
	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto">
					{section.title && (
						<h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-lg text-gray-600 mb-12 text-center">
							{section.summary}
						</p>
					)}
					<Accordion type="single" collapsible className="space-y-4">
						{section.gridItems?.map((item: GridItem) => (
							<AccordionItem
								key={item.id}
								value={item.id}
								className="bg-white rounded-lg shadow-sm border px-6"
							>
								<AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
									{item.title}
								</AccordionTrigger>
								<AccordionContent className="text-gray-600 pb-4">
									{item.description}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}

// Testimonials Section
function TestimonialsSection({ section }: { section: PageSection; }) {
	return (
		<section className="py-16 bg-white">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					{section.title && (
						<h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
							{section.summary}
						</p>
					)}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{section.gridItems?.map((item: GridItem) => (
							<div
								key={item.id}
								className="bg-gray-50 rounded-xl p-6 shadow-lg"
							>
								<div className="flex items-center gap-4 mb-4">
									{item.icon ? (
										<div className="w-12 h-12 rounded-full overflow-hidden relative">
											<Image
												src={item.icon}
												alt={item.title}
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
											{item.title.charAt(0).toUpperCase()}
										</div>
									)}
									<div>
										<h4 className="font-semibold text-gray-900">{item.title}</h4>
									</div>
								</div>
								<p className="text-gray-600 italic">&quot;{item.description}&quot;</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

// Features Section
function FeaturesSection({ section }: { section: PageSection; }) {
	const columns = section.gridColumns || 3;
	const gridCols = {
		2: "md:grid-cols-2",
		3: "md:grid-cols-3",
		4: "md:grid-cols-4",
	}[columns] || "md:grid-cols-3";

	return (
		<section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					{section.title && (
						<h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
							{section.title}
						</h2>
					)}
					{section.summary && (
						<p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
							{section.summary}
						</p>
					)}
					<div className={cn("grid gap-8", gridCols)}>
						{section.gridItems?.map((item: GridItem) => (
							<div
								key={item.id}
								className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
							>
								{item.icon && (
									<div className="w-14 h-14 mb-4 rounded-lg bg-indigo-100 p-3 relative">
										<Image
											src={item.icon}
											alt={item.title}
											fill
											className="object-contain p-2"
										/>
									</div>
								)}
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{item.title}
								</h3>
								<div
									className="text-gray-600 prose prose-sm"
									dangerouslySetInnerHTML={{ __html: item.description }}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

// Main Section Renderer
interface SectionRendererProps {
	section: PageSection;
}

export function SectionRenderer({ section }: SectionRendererProps) {
	switch (section.type) {
		case PageSectionType.RICH_TEXT:
			return <RichTextSection section={section} />;
		case PageSectionType.GRID:
			return <GridSection section={section} />;
		case PageSectionType.CHAT:
			return <ChatSection section={section} />;
		case PageSectionType.HERO:
			return <HeroSection section={section} />;
		case PageSectionType.CTA:
			return <CtaSection section={section} />;
		case PageSectionType.FAQ:
			return <FaqSection section={section} />;
		case PageSectionType.TESTIMONIALS:
			return <TestimonialsSection section={section} />;
		case PageSectionType.FEATURES:
			return <FeaturesSection section={section} />;
		default:
			return <RichTextSection section={section} />;
	}
}

// Render all sections
interface PageSectionsProps {
	sections: PageSection[];
}

export function PageSections({ sections }: PageSectionsProps) {
	// Sort sections by order
	const sortedSections = [...sections].sort((a, b) => a.order - b.order);

	return (
		<div className="page-sections bg-white z-[122]">
			{sortedSections.map((section) => (
				<SectionRenderer key={section.id} section={section} />
			))}
		</div>
	);
}
