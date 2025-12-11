"use client";

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { promoBannerApi } from '@/lib/api/promo-banner.api';
import {
	BANNER_PLACEMENTS,
	PromoBanner,
	PromoBannerFilters,
} from '@/types/promo-banner';
import {
	ArrowUpDown,
	Edit,
	ExternalLink,
	Filter,
	Image as ImageIcon,
	Loader2,
	MoreHorizontal,
	Plus,
	Search,
	Trash2
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { toast } from "sonner";
import { PromoBannerForm } from './components/promo-banner-form';

interface PromoBannersData {
	data: PromoBanner[];
	meta: {
		total: number;
		page: number;
		lastPage: number;
		perPage: number;
	};
}

type SortField = 'title' | 'placement' | 'sortOrder' | 'createdAt';
type SortOrder = 'ASC' | 'DESC';

export default function PromoBannersPage() {
	const [promoBanners, setPromoBanners] = useState<PromoBannersData>({
		data: [],
		meta: { total: 0, page: 1, lastPage: 1, perPage: 20 }
	});
	const [loading, setLoading] = useState(true);
	const [selectedPromoBanner, setSelectedPromoBanner] = useState<PromoBanner | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [promoBannerToDelete, setPromoBannerToDelete] = useState<PromoBanner | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Filters and search
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
	const [placementFilter, setPlacementFilter] = useState<string>('all');

	// Pagination and sorting
	const [page, setPage] = useState(1);
	const [perPage] = useState(20);
	const [sortField, setSortField] = useState<SortField>('sortOrder');
	const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

	const buildFilters = useCallback((): PromoBannerFilters => {
		const filters: PromoBannerFilters = {
			page,
			limit: perPage,
			sortBy: sortField,
			sortOrder,
		};

		if (search.trim()) filters.search = search.trim();
		if (statusFilter === 'active') filters.isActive = true;
		if (statusFilter === 'inactive') filters.isActive = false;
		if (placementFilter !== 'all') filters.placement = placementFilter;

		return filters;
	}, [search, statusFilter, placementFilter, page, perPage, sortField, sortOrder]);

	const fetchPromoBanners = useCallback(async () => {
		try {
			setLoading(true);
			const filters = buildFilters();
			const response = await promoBannerApi.getAll(filters);

			if (Array.isArray(response)) {
				setPromoBanners({
					data: response,
					meta: {
						total: response.length,
						page: 1,
						lastPage: 1,
						perPage: response.length,
					}
				});
			} else {
				setPromoBanners({
					data: response.data,
					meta: {
						total: response.pagination?.total || 0,
						page: response.pagination?.page || 1,
						lastPage: response.pagination?.totalPages || 1,
						perPage: response.pagination?.limit || 20,
					}
				});
			}
		} catch (error) {
			console.error('Failed to fetch promo banners:', error);
			toast.error('Failed to load promo banners');
		} finally {
			setLoading(false);
		}
	}, [buildFilters]);

	useEffect(() => {
		fetchPromoBanners();
	}, [fetchPromoBanners]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
		} else {
			setSortField(field);
			setSortOrder('ASC');
		}
	};

	const handleToggleStatus = async (promoBanner: PromoBanner) => {
		try {
			await promoBannerApi.update(promoBanner.id, { isActive: !promoBanner.isActive });
			toast.success(`Promo banner ${!promoBanner.isActive ? 'activated' : 'deactivated'} successfully`);
			fetchPromoBanners();
		} catch {
			toast.error('Failed to update promo banner status');
		}
	};

	const handleEdit = (promoBanner: PromoBanner) => {
		setSelectedPromoBanner(promoBanner);
		setShowForm(true);
	};

	const handleAdd = () => {
		setSelectedPromoBanner(null);
		setShowForm(true);
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		setSelectedPromoBanner(null);
		fetchPromoBanners();
	};

	const handleFormCancel = () => {
		setShowForm(false);
		setSelectedPromoBanner(null);
	};

	const handleDeleteClick = (promoBanner: PromoBanner) => {
		setPromoBannerToDelete(promoBanner);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!promoBannerToDelete) return;

		try {
			setIsDeleting(true);
			await promoBannerApi.delete(promoBannerToDelete.id);
			toast.success('Promo banner deleted successfully');
			setDeleteDialogOpen(false);
			setPromoBannerToDelete(null);
			fetchPromoBanners();
		} catch {
			toast.error('Failed to delete promo banner');
		} finally {
			setIsDeleting(false);
		}
	};

	const clearFilters = () => {
		setSearch('');
		setStatusFilter('all');
		setPlacementFilter('all');
		setPage(1);
	};

	const hasActiveFilters = search || statusFilter !== 'all' || placementFilter !== 'all';

	const getPlacementLabel = (placement: string) => {
		const found = BANNER_PLACEMENTS.find(p => p.value === placement);
		return found?.label || placement;
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Promo Banners</h1>
					<p className="text-muted-foreground">
						Manage promotional banners for AI Tutor pages
					</p>
				</div>
				<Button onClick={handleAdd}>
					<Plus className="w-4 h-4 mr-2" />
					Add Banner
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filters
					</CardTitle>
					<CardDescription>
						Filter and search through promo banners
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search banners..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>

						<Select value={placementFilter} onValueChange={setPlacementFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Placement" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Placements</SelectItem>
								{BANNER_PLACEMENTS.map((placement) => (
									<SelectItem key={placement.value} value={placement.value}>
										{placement.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
							<SelectTrigger className="w-[100px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>

						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters}>
								Clear
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			<Card className='pt-0'>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[60px]">Image</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort('title')}
								>
									<div className="flex items-center space-x-2">
										<span>Title</span>
										<ArrowUpDown className="w-4 h-4" />
									</div>
								</TableHead>
								<TableHead>Button</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort('placement')}
								>
									<div className="flex items-center space-x-2">
										<span>Placement</span>
										<ArrowUpDown className="w-4 h-4" />
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort('sortOrder')}
								>
									<div className="flex items-center space-x-2">
										<span>Order</span>
										<ArrowUpDown className="w-4 h-4" />
									</div>
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort('createdAt')}
								>
									<div className="flex items-center space-x-2">
										<span>Created</span>
										<ArrowUpDown className="w-4 h-4" />
									</div>
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center py-10">
										<div className="flex items-center justify-center">
											<Loader2 className="w-6 h-6 animate-spin mr-2" />
											Loading promo banners...
										</div>
									</TableCell>
								</TableRow>
							) : promoBanners.data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center py-10">
										<div className="text-muted-foreground">
											No promo banners found
											{hasActiveFilters && (
												<div className="mt-2">
													<Button variant="outline" size="sm" onClick={clearFilters}>
														Clear filters
													</Button>
												</div>
											)}
										</div>
									</TableCell>
								</TableRow>
							) : (
								promoBanners.data.map((banner) => (
									<TableRow key={banner.id}>
										<TableCell>
											{banner.imageUrl ? (
												<div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
													<Image
														src={banner.imageUrl}
														alt={banner.title}
														fill
														className="object-cover"
													/>
												</div>
											) : (
												<div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
													<ImageIcon className="w-6 h-6 text-gray-400" />
												</div>
											)}
										</TableCell>
										<TableCell>
											<div className="max-w-[200px]">
												<p className="font-medium truncate">{banner.title}</p>
												{banner.description && (
													<p className="text-sm text-muted-foreground truncate">
														{banner.description}
													</p>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<span className="text-sm">{banner.buttonText}</span>
												<a
													href={banner.buttonUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800"
												>
													<ExternalLink className="w-3 h-3" />
												</a>
											</div>
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
												{getPlacementLabel(banner.placement)}
											</span>
										</TableCell>
										<TableCell>{banner.sortOrder}</TableCell>
										<TableCell>
											<Switch
												checked={banner.isActive}
												onCheckedChange={() => handleToggleStatus(banner)}
											/>
										</TableCell>
										<TableCell>
											{new Date(banner.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => handleEdit(banner)}>
														<Edit className="w-4 h-4 mr-2" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDeleteClick(banner)}
														className="text-destructive"
													>
														<Trash2 className="w-4 h-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					{/* Pagination */}
					{promoBanners.meta.lastPage > 1 && (
						<div className="flex items-center justify-between px-4 py-4 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {((promoBanners.meta.page - 1) * promoBanners.meta.perPage) + 1} to{' '}
								{Math.min(promoBanners.meta.page * promoBanners.meta.perPage, promoBanners.meta.total)} of{' '}
								{promoBanners.meta.total} results
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(Math.max(1, page - 1))}
									disabled={page === 1}
								>
									Previous
								</Button>
								<div className="text-sm">
									Page {promoBanners.meta.page} of {promoBanners.meta.lastPage}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(Math.min(promoBanners.meta.lastPage, page + 1))}
									disabled={page === promoBanners.meta.lastPage}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Form Dialog */}
			{showForm && (
				<PromoBannerForm
					promoBanner={selectedPromoBanner}
					onSuccess={handleFormSuccess}
					onCancel={handleFormCancel}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Promo Banner</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this promo banner? This action cannot be undone.
							<br />
							<strong>Title:</strong> {promoBannerToDelete?.title}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Deleting...
								</>
							) : (
								'Delete'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
