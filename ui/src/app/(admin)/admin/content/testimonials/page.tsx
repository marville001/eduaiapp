"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { testimonialApi } from '@/lib/api/testimonial.api';
import { Testimonial } from '@/types/testimonial';
import { ArrowDown, ArrowUp, Edit, Eye, EyeOff, MoreHorizontal, Plus, Search, Star, StarIcon, ToggleRight, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { toast } from "sonner";
import { DeleteConfirmDialog } from './components/delete-confirm-dialog';
import { TestimonialForm } from './components/testimonial-form';

export default function TestimonialsPage() {
	const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	// Selection states
	const [selectedTestimonials, setSelectedTestimonials] = useState<Set<string>>(new Set());

	// Form and dialog states
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Testimonial | null>(null);
	const [deleting, setDeleting] = useState<Testimonial | null>(null);

	// Fetch testimonials
	const fetchTestimonials = useCallback(async () => {
		try {
			setLoading(true);
			const response = await testimonialApi.getAll({ activeOnly: false });
			// Handle both array response and paginated response
			const testimonials = Array.isArray(response) ? response : response.data;
			setTestimonials(testimonials);
		} catch {
			toast.error('Failed to fetch testimonials');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTestimonials();
	}, [fetchTestimonials]);

	// Filter testimonials based on search
	const filteredTestimonials = testimonials.filter(testimonial =>
		testimonial.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
		testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
		testimonial.customerCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		testimonial.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Handlers
	const handleCreate = () => {
		setEditing(null);
		setShowForm(true);
	};

	const handleEdit = (testimonial: Testimonial) => {
		setEditing(testimonial);
		setShowForm(true);
	};

	const handleDelete = (testimonial: Testimonial) => {
		setDeleting(testimonial);
	};

	const confirmDelete = async () => {
		if (!deleting) return;

		try {
			await testimonialApi.delete(deleting.testimonialId);
			toast.success('Testimonial deleted successfully');
			await fetchTestimonials();
		} catch {
			toast.error('Failed to delete testimonial');
		} finally {
			setDeleting(null);
		}
	};

	const handleToggleActive = async (testimonial: Testimonial) => {
		try {
			await testimonialApi.toggleActive(testimonial.testimonialId);
			toast.success(`Testimonial ${testimonial.isActive ? 'deactivated' : 'activated'} successfully`);
			await fetchTestimonials();
		} catch {
			toast.error('Failed to update testimonial status');
		}
	};

	const handleToggleFeatured = async (testimonial: Testimonial) => {
		try {
			await testimonialApi.toggleFeatured(testimonial.testimonialId);
			toast.success(`Testimonial ${testimonial.isFeatured ? 'unfeatured' : 'featured'} successfully`);
			await fetchTestimonials();
		} catch {
			toast.error('Failed to update featured status');
		}
	};

	const handleMoveSortOrder = async (testimonial: Testimonial, direction: 'up' | 'down') => {
		try {
			const newSortOrder = direction === 'up' ? testimonial.sortOrder - 1 : testimonial.sortOrder + 1;
			await testimonialApi.updateSortOrder(testimonial.testimonialId, Math.max(0, newSortOrder));
			toast.success('Sort order updated successfully');
			await fetchTestimonials();
		} catch {
			toast.error('Failed to update sort order');
		}
	};

	// Selection handlers
	const toggleTestimonialSelection = (testimonialId: string) => {
		const newSelection = new Set(selectedTestimonials);
		if (newSelection.has(testimonialId)) {
			newSelection.delete(testimonialId);
		} else {
			newSelection.add(testimonialId);
		}
		setSelectedTestimonials(newSelection);
	};

	const toggleAllSelection = () => {
		if (selectedTestimonials.size === filteredTestimonials.length) {
			setSelectedTestimonials(new Set());
		} else {
			setSelectedTestimonials(new Set(filteredTestimonials.map(t => t.testimonialId)));
		}
	};

	// Bulk operations
	const handleBulkToggleActive = async () => {
		const testimonialIds = Array.from(selectedTestimonials);
		try {
			await testimonialApi.bulkToggleActive(testimonialIds);
			toast.success(`Updated ${testimonialIds.length} testimonial(s) successfully`);
			await fetchTestimonials();
			setSelectedTestimonials(new Set());
		} catch {
			toast.error('Failed to update testimonials');
		}
	};

	const handleBulkToggleFeatured = async () => {
		const testimonialIds = Array.from(selectedTestimonials);
		try {
			await testimonialApi.bulkToggleFeatured(testimonialIds);
			toast.success(`Updated ${testimonialIds.length} testimonial(s) successfully`);
			await fetchTestimonials();
			setSelectedTestimonials(new Set());
		} catch {
			toast.error('Failed to update testimonials');
		}
	};

	const handleFormSuccess = async () => {
		setShowForm(false);
		setEditing(null);
		await fetchTestimonials();
	};

	const renderStars = (rating: number) => {
		return (
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`h-4 w-4 ${star <= rating
							? 'text-yellow-400 fill-yellow-400'
							: 'text-gray-300'
							}`}
					/>
				))}
				<span className="text-sm text-gray-600 ml-1">{rating}/5</span>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
					<p className="text-gray-600">Manage customer testimonials and reviews</p>
				</div>
				<div className="flex items-center gap-2">
					{selectedTestimonials.size > 0 && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={handleBulkToggleActive}
							>
								<ToggleRight className="w-4 h-4 mr-2" />
								Toggle Active ({selectedTestimonials.size})
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleBulkToggleFeatured}
							>
								<StarIcon className="w-4 h-4 mr-2" />
								Toggle Featured ({selectedTestimonials.size})
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedTestimonials(new Set())}
							>
								Clear Selection
							</Button>
						</>
					)}
					<Button onClick={handleCreate}>
						<Plus className="w-4 h-4 mr-2" />
						Add Testimonial
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Testimonials</CardTitle>
					<div className="flex items-center gap-4">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search testimonials..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-8">Loading...</div>
					) : filteredTestimonials.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">
								{searchTerm ? 'No testimonials found matching your search.' : 'No testimonials found.'}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={selectedTestimonials.size === filteredTestimonials.length}
											onCheckedChange={toggleAllSelection}
										/>
									</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Content</TableHead>
									<TableHead>Rating</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-center">Sort Order</TableHead>
									<TableHead className="w-32">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredTestimonials.map((testimonial) => (
									<TableRow key={testimonial.testimonialId} className="group">
										<TableCell>
											<Checkbox
												checked={selectedTestimonials.has(testimonial.testimonialId)}
												onCheckedChange={() => toggleTestimonialSelection(testimonial.testimonialId)}
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												{testimonial.customerImage && (
													<Image
														src={testimonial.customerImage}
														alt={testimonial.customerName}
														width={32}
														height={32}
														className="w-8 h-8 rounded-full object-cover"
													/>
												)}
												<div>
													<div className="font-medium">{testimonial.customerName}</div>
													{testimonial.customerTitle && (
														<div className="text-sm text-gray-500">{testimonial.customerTitle}</div>
													)}
													{testimonial.customerCompany && (
														<div className="text-sm text-gray-500">{testimonial.customerCompany}</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="max-w-xs">
												<p className="text-sm truncate">{testimonial.content}</p>
											</div>
										</TableCell>
										<TableCell>
											{renderStars(testimonial.rating)}
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="capitalize">
												{testimonial.category}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Badge variant={testimonial.isActive ? 'default' : 'secondary'}>
													{testimonial.isActive ? 'Active' : 'Inactive'}
												</Badge>
												{testimonial.isFeatured && (
													<Badge variant="outline" className="text-yellow-600 border-yellow-300">
														Featured
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell className="text-center">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleMoveSortOrder(testimonial, 'up')}
													disabled={testimonial.sortOrder <= 0}
													className="h-6 w-6 p-0"
												>
													<ArrowUp className="h-3 w-3" />
												</Button>
												<span className="mx-2">{testimonial.sortOrder}</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleMoveSortOrder(testimonial, 'down')}
													className="h-6 w-6 p-0"
												>
													<ArrowDown className="h-3 w-3" />
												</Button>
											</div>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => handleEdit(testimonial)}>
														<Edit className="w-4 h-4 mr-2" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleToggleActive(testimonial)}>
														{testimonial.isActive ? (
															<EyeOff className="w-4 h-4 mr-2" />
														) : (
															<Eye className="w-4 h-4 mr-2" />
														)}
														{testimonial.isActive ? 'Deactivate' : 'Activate'}
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleToggleFeatured(testimonial)}>
														<Star className="w-4 h-4 mr-2" />
														{testimonial.isFeatured ? 'Unfeature' : 'Feature'}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDelete(testimonial)}
														className="text-red-600"
													>
														<Trash2 className="w-4 h-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Form Dialog */}
			{showForm && (
				<TestimonialForm
					testimonial={editing}
					onSuccess={handleFormSuccess}
					onCancel={() => {
						setShowForm(false);
						setEditing(null);
					}}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				open={!!deleting}
				onOpenChange={() => setDeleting(null)}
				onConfirm={confirmDelete}
				title="Delete Testimonial"
				description={`Are you sure you want to delete the testimonial from "${deleting?.customerName}"? This action cannot be undone.`}
				itemName={deleting?.customerName}
			/>
		</div>
	);
}