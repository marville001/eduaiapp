"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/tiptap/editor/tiptap-editor";
import { blogApi, blogCategoryApi, Blog, CreateBlogDto, UpdateBlogDto } from "@/lib/api/blog.api";

const formSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title too long"),
	slug: z.string().optional(),
	excerpt: z.string().optional(),
	content: z.string().min(1, "Content is required"),
	featuredImage: z.string().optional(),
	status: z.enum(['draft', 'published', 'scheduled', 'archived']).optional(),
	scheduledAt: z.string().optional(),
	categoryId: z.number().optional(),
	seoTitle: z.string().optional(),
	seoDescription: z.string().optional(),
	seoTags: z.array(z.string()).optional(),
	seoImage: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BlogFormProps {
	blog?: Blog;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export default function BlogForm({ blog, onSuccess, onCancel }: BlogFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
	const [seoTagInput, setSeoTagInput] = useState('');
	const [isSlugManual, setIsSlugManual] = useState(false);

	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch categories
	const { data: categories = [] } = useQuery({
		queryKey: ['blog-categories', 'active'],
		queryFn: () => blogCategoryApi.getAll('true'),
	});

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: blog?.title || '',
			slug: blog?.slug || '',
			excerpt: blog?.excerpt || '',
			content: blog?.content || '',
			featuredImage: blog?.featuredImage || '',
			status: blog?.status || 'draft',
			scheduledAt: blog?.scheduledAt ? new Date(blog.scheduledAt).toISOString().slice(0, 16) : '',
			categoryId: blog?.categoryId || undefined,
			seoTitle: blog?.seoTitle || '',
			seoDescription: blog?.seoDescription || '',
			seoTags: blog?.seoTags || [],
			seoImage: blog?.seoImage || '',
		},
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateBlogDto) => blogApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			toast.success('Blog created successfully');
			if (onSuccess) {
				onSuccess();
			} else {
				router.push('/admin/blog');
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create blog');
			setIsSubmitting(false);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBlogDto; }) =>
			blogApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			queryClient.invalidateQueries({ queryKey: ['blog', blog?.id] });
			toast.success('Blog updated successfully');
			if (onSuccess) {
				onSuccess();
			} else {
				router.push('/admin/blog');
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update blog');
			setIsSubmitting(false);
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);

		try {
			const submitData = {
				...data,
				categoryId: data.categoryId || undefined,
				scheduledAt: data.scheduledAt || undefined,
			};

			if (blog) {
				updateMutation.mutate({ id: blog.id.toString(), data: submitData });
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

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex justify-between items-center mb-6">
						<div>
							<h1 className="text-2xl font-bold">
								{blog ? 'Edit Blog Post' : 'Create New Blog Post'}
							</h1>
							<p className="text-gray-600">
								{blog ? 'Update your blog post details' : 'Fill in the details for your new blog post'}
							</p>
						</div>
						<div className="flex gap-2">
							{onCancel && (
								<Button type="button" variant="outline" onClick={onCancel}>
									Cancel
								</Button>
							)}
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : blog ? 'Update Blog' : 'Create Blog'}
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
									<CardHeader>
										<CardTitle>Basic Information</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<FormField
											control={form.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Title *</FormLabel>
													<FormControl>
													<Input
														placeholder="Enter blog title..."
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
																placeholder="blog-post-slug"
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
															placeholder="Brief description of your blog post..."
															rows={3}
															{...field}
														/>
													</FormControl>
													<FormDescription>
														A short summary that appears in blog listings
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
													<FormLabel>Featured Image URL</FormLabel>
													<FormControl>
														<Input
															placeholder="https://example.com/image.jpg"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Content *</CardTitle>
									</CardHeader>
									<CardContent>
										<FormField
											control={form.control}
											name="content"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<TiptapEditor
															value={field.value}
															onChange={({ html }) => field.onChange(html)}
															showToolbar={true}
															containerClasses="h-[500px]"
															// className="min-h-[350px]"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>
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
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select status" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="draft">Draft</SelectItem>
															<SelectItem value="published">Published</SelectItem>
															<SelectItem value="scheduled">Scheduled</SelectItem>
															<SelectItem value="archived">Archived</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										{form.getValues('status') === 'scheduled' && (
											<FormField
												control={form.control}
												name="scheduledAt"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Scheduled Date & Time</FormLabel>
														<FormControl>
															<Input
																type="datetime-local"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}

										<FormField
											control={form.control}
											name="categoryId"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Category</FormLabel>
													<Select
														// onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
														//   defaultValue={field.value?.toString()}
														onValueChange={(value) => {
															field.onChange(value === "none" ? undefined : parseInt(value));
														}}
														value={field.value?.toString() || "none"}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select category" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="none">No Category</SelectItem>
															{categories.map((category) => (
																<SelectItem key={category.id} value={category.id.toString()}>
																	{category.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>

								{blog && (
									<Card>
										<CardHeader>
											<CardTitle>Statistics</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Views:</span>
												<span className="font-medium">{blog.views}</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Likes:</span>
												<span className="font-medium">{blog.likes}</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Reading Time:</span>
												<span className="font-medium">{blog.readingTime} min</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Created:</span>
												<span className="font-medium">
													{new Date(blog.createdAt).toLocaleDateString()}
												</span>
											</div>
											<div className="flex justify-between items-center text-sm">
												<span className="text-gray-600">Last Updated:</span>
												<span className="font-medium">
													{new Date(blog.updatedAt).toLocaleDateString()}
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
										Optimize your blog post for search engines
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
													If left empty, the blog title will be used
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
												<FormLabel>SEO Image URL</FormLabel>
												<FormControl>
													<Input
														placeholder="https://example.com/seo-image.jpg"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Image that appears when shared on social media
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
		</div>
	);
}