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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { footerColumnApi } from '@/lib/api/footer-menu.api';
import { FooterColumn } from '@/types/footer-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const footerColumnSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
	slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters'),
	description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
	isActive: z.boolean(),
	sortOrder: z.number().min(0, 'Sort order must be 0 or greater'),
});

type FooterColumnFormData = z.infer<typeof footerColumnSchema>;

interface FooterColumnFormProps {
	column?: FooterColumn | null;
	onSuccess: () => void;
	onCancel: () => void;
}

export function FooterColumnForm({ column, onSuccess, onCancel }: FooterColumnFormProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const isEditing = !!column;

	const form = useForm<FooterColumnFormData>({
		resolver: zodResolver(footerColumnSchema),
		defaultValues: {
			title: column?.title || '',
			slug: column?.slug || '',
			description: column?.description || '',
			isActive: column?.isActive ?? true,
			sortOrder: column?.sortOrder ?? 0,
		},
	});

	// Auto-generate slug from title
	const watchedTitle = form.watch('title');
	useEffect(() => {
		if (!isEditing && watchedTitle) {
			const slug = watchedTitle
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, '')
				.replace(/\s+/g, '-')
				.trim();
			form.setValue('slug', slug, { shouldValidate: true });
		}
	}, [watchedTitle, isEditing, form]);

	const onSubmit = async (data: FooterColumnFormData) => {
		try {
			setIsSubmitting(true);

			if (isEditing && column) {
				await footerColumnApi.update(column.id + "", data);
				toast.success('Column updated successfully');
			} else {
				await footerColumnApi.create(data);
				toast.success('Column created successfully');
			}

			onSuccess();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save column');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit Footer Column' : 'Create Footer Column'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Enter column title" {...field} />
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
										<Input placeholder="column-slug" {...field} />
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
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Optional description for this column"
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
											Make this column visible to users
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
								{isSubmitting ? 'Saving...' : isEditing ? 'Update Column' : 'Create Column'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}