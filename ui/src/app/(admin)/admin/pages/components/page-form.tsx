/* eslint-disable react-hooks/incompatible-library */
"use client";

import { ImageUpload } from "@/components/forms/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreatePageDto, Page, pageApi, PageSection, UpdatePageDto } from "@/lib/api/page.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Eye, Plus, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageSectionsEditor } from "./page-editor";
import { PagePreviewModal } from "./page-preview-modal";

const formSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title too long"),
	slug: z.string().optional(),
	excerpt: z.string().optional(),
	content: z.string().optional(),
	sections: z.array(z.any()).optional(),
	featuredImage: z.string().optional(),
	status: z.enum(['draft', 'published', 'archived']).optional(),
	seoTitle: z.string().optional(),
	seoDescription: z.string().optional(),
	seoTags: z.array(z.string()).optional(),
	seoImage: z.string().optional(),
	canonicalUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PageFormProps {
	page?: Page;
	onSuccess?: () => void;
	onCancel?: () => void;
	redirectToViewAll?: boolean;
}

export default function PageForm({ page, onSuccess, onCancel, redirectToViewAll }: PageFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
	const [seoTagInput, setSeoTagInput] = useState('');
	const [isSlugManual, setIsSlugManual] = useState(false);
	const [sections, setSections] = useState<PageSection[]>(page?.sections || []);
	const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: page?.title || '',
			slug: page?.slug || '',
			excerpt: page?.excerpt || '',
			content: page?.content || '',
			sections: page?.sections || [],
			featuredImage: page?.featuredImage || '',
			status: page?.status || 'draft',
			seoTitle: page?.seoTitle || '',
			seoDescription: page?.seoDescription || '',
			seoTags: page?.seoTags || [],
			seoImage: page?.seoImage || '',
			canonicalUrl: page?.canonicalUrl || '',
		},
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: CreatePageDto) => pageApi.create(data),
		onSuccess: async (newPage) => {
			queryClient.invalidateQueries({ queryKey: ['pages'] });
			toast.success('Page created successfully');

			// Trigger revalidation for the new page if it's published
			if (newPage.status === 'published' && newPage.isActive) {
				try {
					await fetch(`/api/revalidate/${newPage.slug}`, { method: 'GET' });
					console.log(`Revalidated page: /${newPage.slug}`);
				} catch (error) {
					console.error('Failed to revalidate page:', error);
				}
			}

			form.reset();
			setIsSubmitting(false);
			if (onSuccess) {
				onSuccess();
			} else {
				router.push('/admin/pages');
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create page');
			setIsSubmitting(false);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdatePageDto; }) =>
			pageApi.update(id, data),
		onSuccess: async (updatedPage) => {
			queryClient.invalidateQueries({ queryKey: ['pages'] });
			queryClient.invalidateQueries({ queryKey: ['page', page?.id] });
			toast.success('Page updated successfully');

			// Trigger revalidation for the updated page if it's published
			try {
				await fetch(`/api/revalidate/${updatedPage.slug}`, { method: 'GET' });
				console.log(`Revalidated page: /${updatedPage.slug}`);
			} catch (error) {
				console.error('Failed to revalidate page:', error);
			}
			setIsSubmitting(false);
			if (onSuccess) {
				onSuccess();
			} else {
				if (redirectToViewAll) {
					router.push('/admin/pages');
				}
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update page');
			setIsSubmitting(false);
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);

		// Include sections in the data
		const submitData = {
			...data,
			sections: sections,
		};

		try {
			if (page) {
				updateMutation.mutate({ id: page.id.toString(), data: submitData });
			} else {
				createMutation.mutate(submitData);
			}
		} catch (error) {
			console.error('Submit error:', error);
			setIsSubmitting(false);
		}
	};

	const generateSlug = (title: string) => {
		const slug = title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
		form.setValue('slug', slug);
	};

	const addSeoTag = () => {
		if (seoTagInput.trim()) {
			const currentTags = form.getValues('seoTags') || [];
			if (!currentTags.includes(seoTagInput.trim())) {
				form.setValue('seoTags', [...currentTags, seoTagInput.trim()]);
			}
			setSeoTagInput('');
		}
	};

	const removeSeoTag = (tagToRemove: string) => {
		const currentTags = form.getValues('seoTags') || [];
		form.setValue('seoTags', currentTags.filter(tag => tag !== tagToRemove));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addSeoTag();
		}
	};

	const { setValue } = form;
	useEffect(() => {
		if (page) {
			setValue('title', page.title);
			setValue('slug', page.slug || '');
			setValue('excerpt', page.excerpt || '');
			setValue('content', page.content || '');
			setValue('sections', page.sections || []);
			setValue('featuredImage', page.featuredImage || '');
			setValue('status', page.status || 'draft');
			setValue('seoTitle', page.seoTitle || '');
			setValue('seoDescription', page.seoDescription || '');
			setValue('seoTags', page.seoTags || []);
			setValue('seoImage', page.seoImage || '');
			setValue('canonicalUrl', page.canonicalUrl || '');

			setSections(page.sections || []);
		}
	}, [setValue, page]);

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex justify-between items-center mb-6">
						<div>
							<h1 className="text-2xl font-bold">
								{page ? 'Edit Page' : 'Create New Page'}
							</h1>
							<p className="text-gray-600">
								{page ? 'Update your page details' : 'Fill in the details for your new page'}
							</p>
						</div>
						<div className="flex gap-2">
							{onCancel && (
								<Button type="button" variant="outline" onClick={onCancel}>
									Cancel
								</Button>
							)}
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsPreviewOpen(true)}
							>
								<Eye className="h-4 w-4 mr-2" />
								Preview
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
							</Button>
						</div>
					</div>

					{/* Tab Navigation */}
					<div className="flex border-b mb-6">
						<button
							type="button"
							onClick={() => setActiveTab('content')}
							className={`px-4 py-2 font-medium ${activeTab === 'content'
								? 'border-b-2 border-blue-500 text-blue-600'
								: 'text-gray-500 hover:text-gray-700'
								}`}
						>
							Content
						</button>
						<button
							type="button"
							onClick={() => setActiveTab('seo')}
							className={`px-4 py-2 font-medium ${activeTab === 'seo'
								? 'border-b-2 border-blue-500 text-blue-600'
								: 'text-gray-500 hover:text-gray-700'
								}`}
						>
							SEO Settings
						</button>
					</div>

					{activeTab === 'content' && (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Main Content */}
							<div className="lg:col-span-2 space-y-6">
								<Card>
									<CardHeader className='flex items-center justify-between'>
										<CardTitle>Basic Information</CardTitle>
										<Button
											variant="ghost"
											size="sm"
											type="button"
											onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
										>
											{isBasicInfoExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
										</Button>
									</CardHeader>
									{
										isBasicInfoExpanded && (
											<CardContent className="space-y-4">
												<FormField
													control={form.control}
													name="title"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Title *</FormLabel>
															<FormControl>
																<Input
																	placeholder="Enter page title..."
																	{...field}
																	onChange={(e) => {
																		field.onChange(e);
																		if (!isSlugManual) {
																			generateSlug(e.target.value);
																		}
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="slug"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Slug</FormLabel>
															<FormControl>
																<div className="relative">
																	<Input
																		placeholder="page-slug"
																		{...field}
																		onChange={(e) => {
																			field.onChange(e);
																			setIsSlugManual(true);
																		}}
																	/>
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		onClick={() => {
																			const title = form.getValues('title');
																			if (title) {
																				generateSlug(title);
																				setIsSlugManual(false);
																			}
																		}}
																		className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
																	>
																		<RefreshCw className="w-3 h-3" />
																	</Button>
																</div>
															</FormControl>
															<FormDescription>
																URL-friendly version of the title
															</FormDescription>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="excerpt"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Excerpt</FormLabel>
															<FormControl>
																<Textarea
																	placeholder="Brief description of your page..."
																	rows={3}
																	{...field}
																/>
															</FormControl>
															<FormDescription>
																A short summary that appears in page listings
															</FormDescription>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="featuredImage"
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<ImageUpload
																	value={field.value}
																	onChange={field.onChange}
																	label="Featured Image"
																	description="Main image that appears with your page"
																	placeholder="https://example.com/featured-image.jpg"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</CardContent>
										)
									}
								</Card>

								{/* Page Sections Editor */}
								<PageSectionsEditor
									sections={sections}
									onChange={setSections}
								/>
							</div>

							{/* Sidebar */}
							<div className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle>Publishing Options</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="status"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Status</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select status" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="draft">Draft</SelectItem>
															<SelectItem value="published">Published</SelectItem>
															<SelectItem value="archived">Archived</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{page && (
									<Card>
										<CardHeader>
											<CardTitle>Statistics</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Views:</span>
												<span className="font-medium">{page.views}</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Reading Time:</span>
												<span className="font-medium">{page.readingTime} min</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Created:</span>
												<span className="font-medium">
													{new Date(page.createdAt).toLocaleDateString()}
												</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Last Updated:</span>
												<span className="font-medium">
													{new Date(page.updatedAt).toLocaleDateString()}
												</span>
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					)}

					{activeTab === 'seo' && (
						<div className="max-w-2xl">
							<Card>
								<CardHeader>
									<CardTitle>SEO Settings</CardTitle>
									<p className="text-sm text-gray-600">
										Optimize your page for search engines
									</p>
								</CardHeader>
								<CardContent className="space-y-4">
									<FormField
										control={form.control}
										name="seoTitle"
										render={({ field }) => (
											<FormItem>
												<FormLabel>SEO Title</FormLabel>
												<FormControl>
													<Input
														placeholder="SEO-optimized title..."
														{...field}
													/>
												</FormControl>
												<FormDescription>
													If left empty, the page title will be used
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="seoDescription"
										render={({ field }) => (
											<FormItem>
												<FormLabel>SEO Description</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Description for search engines..."
														rows={3}
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Recommended length: 150-160 characters
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormItem>
										<FormLabel>SEO Tags</FormLabel>
										<div className="space-y-2">
											<div className="flex gap-2">
												<Input
													placeholder="Add a tag..."
													value={seoTagInput}
													onChange={(e) => setSeoTagInput(e.target.value)}
													onKeyPress={handleKeyPress}
												/>
												<Button type="button" onClick={addSeoTag}>
													<Plus className="w-4 h-4" />
												</Button>
											</div>
											<div className="flex flex-wrap gap-2">
												{form.getValues('seoTags')?.map((tag, index) => (
													<Badge key={index} variant="secondary" className="flex items-center gap-1">
														{tag}
														<X
															className="w-3 h-3 cursor-pointer hover:text-red-500"
															onClick={() => removeSeoTag(tag)}
														/>
													</Badge>
												))}
											</div>
										</div>
										<FormDescription>
											Add relevant keywords and topics
										</FormDescription>
									</FormItem>

									<FormField
										control={form.control}
										name="seoImage"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<ImageUpload
														value={field.value}
														onChange={field.onChange}
														label="SEO Image"
														description="Image that appears when shared on social media (1200x630px recommended)"
														placeholder="https://example.com/seo-image.jpg"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="canonicalUrl"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Canonical URL</FormLabel>
												<FormControl>
													<Input
														placeholder="https://example.com/original-page"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													The preferred URL for this content if it exists on multiple URLs
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
							</Card>
						</div>
					)}
				</form>
			</Form>

			{/* Preview Modal */}
			<PagePreviewModal
				open={isPreviewOpen}
				onOpenChange={setIsPreviewOpen}
				page={{
					...page,
					title: form.watch('title') || page?.title || '',
					excerpt: form.watch('excerpt') || page?.excerpt || '',
					featuredImage: form.watch('featuredImage') || page?.featuredImage || '',
					sections: sections,
				}}
			/>
		</div>
	);
}