"use client";

import { ImageUpload } from '@/components/forms/image-upload';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
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
import { promoBannerApi } from '@/lib/api/promo-banner.api';
import {
	BANNER_PLACEMENTS,
	BUTTON_VARIANTS,
	CreatePromoBannerData,
	PromoBanner,
} from '@/types/promo-banner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';

const promoBannerSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
	description: z.string().optional(),
	imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
	buttonText: z.string().min(1, 'Button text is required').max(100, 'Button text must be less than 100 characters'),
	buttonUrl: z.string().min(1, 'Button URL is required').max(500, 'Button URL must be less than 500 characters'),
	buttonVariant: z.string(),
	sortOrder: z.number().min(0, 'Sort order must be 0 or greater'),
	placement: z.string(),
	isActive: z.boolean(),
});

type FormData = z.infer<typeof promoBannerSchema>;

interface PromoBannerFormProps {
	promoBanner?: PromoBanner | null;
	onSuccess: () => void;
	onCancel: () => void;
}

export function PromoBannerForm({ promoBanner, onSuccess, onCancel }: PromoBannerFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!promoBanner;

	const form = useForm<FormData>({
		resolver: zodResolver(promoBannerSchema),
		defaultValues: {
			title: promoBanner?.title || '',
			description: promoBanner?.description || '',
			imageUrl: promoBanner?.imageUrl || '',
			buttonText: promoBanner?.buttonText || '',
			buttonUrl: promoBanner?.buttonUrl || '',
			buttonVariant: promoBanner?.buttonVariant || 'primary',
			sortOrder: promoBanner?.sortOrder || 0,
			placement: promoBanner?.placement || 'ai-tutor',
			isActive: promoBanner?.isActive ?? true,
		},
	});

	const handleSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);

			const submitData: CreatePromoBannerData = {
				...data,
				imageUrl: data.imageUrl || undefined,
				description: data.description || undefined,
			};

			if (isEditing && promoBanner) {
				await promoBannerApi.update(promoBanner.id, submitData);
				toast.success('Promo banner updated successfully');
			} else {
				await promoBannerApi.create(submitData);
				toast.success('Promo banner created successfully');
			}

			onSuccess();
		} catch (error: unknown) {
			const errorObj = error as { response?: { data?: { message?: string; }; }; };
			const message = errorObj?.response?.data?.message || 'An error occurred';
			toast.error(`Failed to ${isEditing ? 'update' : 'create'} promo banner: ${message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit Promo Banner' : 'Add New Promo Banner'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
						{/* Title */}
						<FormField
							name="title"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title *</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter banner title..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Description */}
						<FormField
							name="description"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter banner description..."
											className="min-h-20 resize-y"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Image Upload */}
						<FormField
							name="imageUrl"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<ImageUpload
											value={field.value}
											onChange={field.onChange}
											label="Banner Image"
											description="Upload an image for the promo banner (recommended: 800x400px)"
											placeholder="https://example.com/image.jpg"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Button Text */}
						<FormField
							name="buttonText"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Button Text *</FormLabel>
									<FormControl>
										<Input
											placeholder="Learn More"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Button URL */}
						<FormField
							name="buttonUrl"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Button URL *</FormLabel>
									<FormControl>
										<Input
											placeholder="/pricing or https://example.com"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Can be a relative path (e.g., /pricing) or full URL
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							{/* Button Variant */}
							<FormField
								name="buttonVariant"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Button Style</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select style" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{BUTTON_VARIANTS.map((variant) => (
													<SelectItem key={variant.value} value={variant.value}>
														{variant.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Placement */}
							<FormField
								name="placement"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Placement</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select placement" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{BANNER_PLACEMENTS.map((placement) => (
													<SelectItem key={placement.value} value={placement.value}>
														{placement.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Sort Order */}
						<FormField
							name="sortOrder"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sort Order</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											{...field}
											value={field.value || ''}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Status Switch */}
						<FormField
							name="isActive"
							control={form.control}
							render={({ field }) => (
								<FormItem className="flex items-center gap-2 space-y-0">
									<FormLabel>Active</FormLabel>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Form Actions */}
						<div className="flex items-center justify-end gap-3 pt-6 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										{isEditing ? 'Updating...' : 'Creating...'}
									</>
								) : (
									<>{isEditing ? 'Update Banner' : 'Create Banner'}</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
