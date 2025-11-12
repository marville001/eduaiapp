"use client";

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { footerItemApi } from '@/lib/api/footer-menu.api';
import { FooterColumn, FooterItem } from '@/types/footer-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const footerItemSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
	slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters'),
	url: z.string().max(500, 'URL must be less than 500 characters').optional().or(z.literal('')),
	target: z.string(),
	icon: z.string().max(100, 'Icon must be less than 100 characters').optional().or(z.literal('')),
	description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
	isActive: z.boolean(),
	sortOrder: z.number().min(0, 'Sort order must be 0 or greater'),
	columnId: z.string().min(1, 'Column is required'),
});

type FooterItemFormData = z.infer<typeof footerItemSchema>;

interface FooterItemFormProps {
	item?: FooterItem | null;
	columnId: string;
	columns: FooterColumn[];
	onSuccess: () => void;
	onCancel: () => void;
}

export function FooterItemForm({ item, columnId, columns, onSuccess, onCancel }: FooterItemFormProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const isEditing = !!item;

	const form = useForm<FooterItemFormData>({
		resolver: zodResolver(footerItemSchema),
		defaultValues: {
			title: item?.title || '',
			slug: item?.slug || '',
			url: item?.url || '',
			target: item?.target || '_self',
			icon: item?.icon || '',
			description: item?.description || '',
			isActive: item?.isActive ?? true,
			sortOrder: item?.sortOrder ?? 0,
			columnId: item?.columnId ? item.columnId + "" : columnId,
		},
	});

	console.log(item);


	// Auto-generate slug from title
	const watchedTitle = form.watch('title');
	useEffect(() => {
		if (!isEditing && watchedTitle) {
			const slug = watchedTitle
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, '')
				.replace(/\s+/g, '-')
				.trim();
			form.setValue('slug', slug);
		}
	}, [watchedTitle, isEditing, form]);

	const onSubmit = async (data: FooterItemFormData) => {
		try {
			setIsSubmitting(true);

			if (isEditing && item) {
				await footerItemApi.update(item.id + "", data);
				toast.success('Item updated successfully');
			} else {
				await footerItemApi.create(data);
				toast.success('Item created successfully');
			}

			onSuccess();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save item');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit Footer Item' : 'Create Footer Item'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="columnId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Column</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a column" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{columns.map((column) => (
												<SelectItem key={column.id} value={column.id + ""}>
													{column.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Enter item title" {...field} />
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
										<Input placeholder="item-slug" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="url"
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="https://example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="target"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Link Target</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="_self">Same Window</SelectItem>
											<SelectItem value="_blank">New Window</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="icon"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Icon (Optional)</FormLabel>
									<FormControl>
										<Input placeholder="icon-name or URL" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Optional description for this item"
											{...field}
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="sortOrder"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sort Order</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Active</FormLabel>
										<div className="text-sm text-muted-foreground">
											Make this item visible to users
										</div>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onCancel}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}