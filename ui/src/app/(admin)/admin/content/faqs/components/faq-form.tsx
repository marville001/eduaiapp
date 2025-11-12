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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { faqApi } from '@/lib/api/faq.api';
import {
	CreateFaqData,
	Faq,
} from '@/types/faq';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { z } from 'zod';

const faqSchema = z.object({
	question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
	answer: z.string().min(1, 'Answer is required'),
	sortOrder: z.number().min(0, 'Sort order must be 0 or greater'),
	isActive: z.boolean(),
});

type FormData = z.infer<typeof faqSchema>;

interface FaqFormProps {
	faq?: Faq | null;
	onSuccess: () => void;
	onCancel: () => void;
}

export function FaqForm({ faq, onSuccess, onCancel }: FaqFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!faq;

	const form = useForm<FormData>({
		resolver: zodResolver(faqSchema),
		defaultValues: {
			question: faq?.question || '',
			answer: faq?.answer || '',
			sortOrder: faq?.sortOrder || 0,
			isActive: faq?.isActive ?? true,
		},
	});

	const handleSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);

			const submitData: CreateFaqData = {
				...data,
			};

			if (isEditing && faq) {
				await faqApi.update(faq.id, submitData);
				toast.success('FAQ updated successfully');
			} else {
				await faqApi.create(submitData);
				toast.success('FAQ created successfully');
			}

			onSuccess();
		} catch (error: unknown) {
			const errorObj = error as { response?: { data?: { message?: string; }; }; };
			const message = errorObj?.response?.data?.message || 'An error occurred';
			toast.error(`Failed to ${isEditing ? 'update' : 'create'} FAQ: ${message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit FAQ' : 'Add New FAQ'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
						{/* Question */}
						<FormField
							name="question"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Question *</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter the FAQ question..."
											className="min-h-20 resize-y"
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<p className="text-sm text-gray-500">
										{field.value?.length || 0}/500 characters
									</p>
								</FormItem>
							)}
						/>

						{/* Answer */}
						<FormField
							name="answer"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Answer *</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter the FAQ answer..."
											className="min-h-[120px] resize-y"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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

						{/* Status Switches */}
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
									<>{isEditing ? 'Update FAQ' : 'Create FAQ'}</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}