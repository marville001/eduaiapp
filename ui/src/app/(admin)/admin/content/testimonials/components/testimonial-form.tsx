"use client";

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
import { testimonialApi } from '@/lib/api/testimonial.api';
import {
	CreateTestimonialData,
	Testimonial,
	TESTIMONIAL_CATEGORIES,
	TESTIMONIAL_RATINGS,
	TestimonialCategory
} from '@/types/testimonial';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';

const testimonialSchema = z.object({
	customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name too long'),
	customerEmail: z.string().optional(),
	customerImage: z.string().optional(),
	customerTitle: z.string().optional(),
	customerCompany: z.string().optional(),
	content: z.string().min(10, 'Content must be at least 10 characters').max(1000, 'Content too long'),
	rating: z.number().int().min(1, 'Rating is required').max(5, 'Invalid rating'),
	category: z.enum(['general', 'course', 'support', 'platform', 'instructor'] as const, {
		message: 'Category is required',
	}),
	isActive: z.boolean(),
	isFeatured: z.boolean(),
}).superRefine((data, ctx) => {
	// Custom email validation
	if (data.customerEmail && data.customerEmail.trim() !== '') {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.customerEmail)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Invalid email format',
				path: ['customerEmail'],
			});
		}
	}

	// Custom URL validation for image
	if (data.customerImage && data.customerImage.trim() !== '') {
		const urlRegex = /^https?:\/\/.+/;
		if (!urlRegex.test(data.customerImage)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Invalid image URL',
				path: ['customerImage'],
			});
		}
	}
});

type FormData = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
	testimonial?: Testimonial | null;
	onSuccess: () => void;
	onCancel: () => void;
}

export function TestimonialForm({ testimonial, onSuccess, onCancel }: TestimonialFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!testimonial;

	const form = useForm<FormData>({
		resolver: zodResolver(testimonialSchema),
		defaultValues: {
			customerName: testimonial?.customerName || '',
			customerEmail: testimonial?.customerEmail || '',
			customerImage: testimonial?.customerImage || '',
			customerTitle: testimonial?.customerTitle || '',
			customerCompany: testimonial?.customerCompany || '',
			content: testimonial?.content || '',
			rating: testimonial?.rating || 5,
			category: (testimonial?.category as TestimonialCategory) || 'general',
			isActive: testimonial?.isActive ?? true,
			isFeatured: testimonial?.isFeatured ?? false,
		},
	});

	const handleSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);

			const submitData: CreateTestimonialData = {
				...data,
				customerEmail: data.customerEmail || undefined,
				customerImage: data.customerImage || undefined,
				customerTitle: data.customerTitle || undefined,
				customerCompany: data.customerCompany || undefined,
			};

			if (isEditing && testimonial) {
				await testimonialApi.update(testimonial.testimonialId, submitData);
				toast.success('Testimonial updated successfully');
			} else {
				await testimonialApi.create(submitData);
				toast.success('Testimonial created successfully');
			}

			onSuccess();
		} catch (error: unknown) {
			const errorObj = error as { response?: { data?: { message?: string; }; }; };
			const message = errorObj?.response?.data?.message || 'An error occurred';
			toast.error(`Failed to ${isEditing ? 'update' : 'create'} testimonial: ${message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderRatingSelector = () => {
		const currentRating = form.watch('rating');

		return (
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					{TESTIMONIAL_RATINGS.map((rating: number) => (
						<button
							key={rating}
							type="button"
							onClick={() => form.setValue('rating', rating)}
							className={`p-2 rounded-lg border transition-colors ${currentRating >= rating
									? 'bg-yellow-50 border-yellow-300 text-yellow-700'
									: 'bg-gray-50 border-gray-200 text-gray-400 hover:text-yellow-600'
								}`}
						>
							<Star
								className={`h-5 w-5 ${currentRating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-current'
									}`}
							/>
						</button>
					))}
					<span className="ml-2 text-sm text-gray-600">
						{currentRating}/5
					</span>
				</div>
			</div>
		);
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Customer Name */}
							<FormField
								name="customerName"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Name *</FormLabel>
										<FormControl>
											<Input placeholder="Enter customer name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Customer Email */}
							<FormField
								name="customerEmail"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="Enter customer email"
												{...field}
												value={field.value || ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Customer Title */}
							<FormField
								name="customerTitle"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Title</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter customer title"
												{...field}
												value={field.value || ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Customer Company */}
							<FormField
								name="customerCompany"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer Company</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter customer company"
												{...field}
												value={field.value || ''}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Customer Image */}
						<FormField
							name="customerImage"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Customer Image URL</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter image URL"
											{...field}
											value={field.value || ''}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Content */}
						<FormField
							name="content"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Testimonial Content *</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter testimonial content..."
											className="min-h-[120px] resize-y"
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<p className="text-sm text-gray-500">
										{field.value?.length || 0}/1000 characters
									</p>
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Rating */}
							<FormField
								name="rating"
								control={form.control}
								render={() => (
									<FormItem>
										<FormLabel>Rating *</FormLabel>
										<FormControl>
											<div>{renderRatingSelector()}</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Category */}
							<FormField
								name="category"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{TESTIMONIAL_CATEGORIES.map((category) => (
													<SelectItem key={category} value={category}>
														<span className="capitalize">{category}</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Status Switches */}
						<div className="flex items-center gap-6 pt-4 border-t">
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

							<FormField
								name="isFeatured"
								control={form.control}
								render={({ field }) => (
									<FormItem className="flex items-center gap-2 space-y-0">
										<FormLabel>Featured</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

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
									<>{isEditing ? 'Update Testimonial' : 'Create Testimonial'}</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}