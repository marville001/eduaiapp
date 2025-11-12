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
import { faqApi } from '@/lib/api/faq.api';
import {
	Faq,
	FaqFilters,
} from '@/types/faq';
import {
	ArrowUpDown,
	Edit,
	Filter,
	Loader2,
	MoreHorizontal,
	Plus,
	Search,
	Trash2
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from "sonner";
import { FaqForm } from './components/faq-form';

interface FaqsData {
	data: Faq[];
	meta: {
		total: number;
		page: number;
		lastPage: number;
		perPage: number;
	};
}

type SortField = 'question' | 'category' | 'priority' | 'sortOrder' | 'viewCount' | 'createdAt';
type SortOrder = 'ASC' | 'DESC';

export default function FaqsPage() {
	const [faqs, setFaqs] = useState<FaqsData>({ data: [], meta: { total: 0, page: 1, lastPage: 1, perPage: 20 } });
	const [loading, setLoading] = useState(true);
	const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Filters and search
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

	// Pagination and sorting
	const [page, setPage] = useState(1);
	const [perPage] = useState(20);
	const [sortField, setSortField] = useState<SortField>('sortOrder');
	const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

	const buildFilters = useCallback((): FaqFilters => {
		const filters: FaqFilters = {
			page,
			limit: perPage,
			sortBy: sortField,
			sortOrder,
		};

		if (search.trim()) filters.search = search.trim();
		if (statusFilter === 'active') filters.isActive = true;
		if (statusFilter === 'inactive') filters.isActive = false;

		return filters;
	}, [search, statusFilter, page, perPage, sortField, sortOrder]);

	const fetchFaqs = useCallback(async () => {
		try {
			setLoading(true);
			const filters = buildFilters();
			const response = await faqApi.getAll(filters);

			// Handle different response formats
			if (Array.isArray(response)) {
				// Simple array response
				setFaqs({
					data: response,
					meta: {
						total: response.length,
						page: 1,
						lastPage: 1,
						perPage: response.length,
					}
				});
			} else {
				// Paginated response
				setFaqs({
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
			console.error('Failed to fetch FAQs:', error);
			toast.error('Failed to load FAQs');
		} finally {
			setLoading(false);
		}
	}, [buildFilters]);

	useEffect(() => {
		fetchFaqs();
	}, [fetchFaqs]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
		} else {
			setSortField(field);
			setSortOrder('ASC');
		}
	};

	const handleToggleStatus = async (faq: Faq) => {
		try {
			await faqApi.update(faq.id, { isActive: !faq.isActive });
			toast.success(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'} successfully`);
			fetchFaqs();
		} catch {
			toast.error('Failed to update FAQ status');
		}
	};


	const handleEdit = (faq: Faq) => {
		setSelectedFaq(faq);
		setShowForm(true);
	};

	const handleAdd = () => {
		setSelectedFaq(null);
		setShowForm(true);
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		setSelectedFaq(null);
		fetchFaqs();
	};

	const handleFormCancel = () => {
		setShowForm(false);
		setSelectedFaq(null);
	};

	const handleDeleteClick = (faq: Faq) => {
		setFaqToDelete(faq);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!faqToDelete) return;

		try {
			setIsDeleting(true);
			await faqApi.delete(faqToDelete.id);
			toast.success('FAQ deleted successfully');
			setDeleteDialogOpen(false);
			setFaqToDelete(null);
			fetchFaqs();
		} catch {
			toast.error('Failed to delete FAQ');
		} finally {
			setIsDeleting(false);
		}
	};

	const clearFilters = () => {
		setSearch('');
		setStatusFilter('all');
		setPage(1);
	};

	const hasActiveFilters = search || statusFilter !== 'all';

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
					<p className="text-muted-foreground">
						Manage frequently asked questions
					</p>
				</div>
				<Button onClick={handleAdd}>
					<Plus className="w-4 h-4 mr-2" />
					Add FAQ
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filters
					</CardTitle>
					<CardDescription>
						Filter and search through FAQs
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search FAQs..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>

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
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort('question')}
								>
									<div className="flex items-center space-x-2">
										<span>Question</span>
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
									<TableCell colSpan={9} className="text-center py-10">
										<div className="flex items-center justify-center">
											<Loader2 className="w-6 h-6 animate-spin mr-2" />
											Loading FAQs...
										</div>
									</TableCell>
								</TableRow>
							) : faqs.data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center py-10">
										<div className="text-muted-foreground">
											No FAQs found
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
								faqs.data.map((faq) => (
									<TableRow key={faq.id}>
										<TableCell>
											<div className="max-w-[300px]">
												<p className="font-medium truncate">{faq.question}</p>
											</div>
										</TableCell>
										<TableCell>{faq.sortOrder}</TableCell>
										<TableCell>
											<Switch
												checked={faq.isActive}
												onCheckedChange={() => handleToggleStatus(faq)}
											/>
										</TableCell>
										<TableCell>
											{new Date(faq.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => handleEdit(faq)}>
														<Edit className="w-4 h-4 mr-2" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDeleteClick(faq)}
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
					{faqs.meta.lastPage > 1 && (
						<div className="flex items-center justify-between px-4 py-4 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {((faqs.meta.page - 1) * faqs.meta.perPage) + 1} to{' '}
								{Math.min(faqs.meta.page * faqs.meta.perPage, faqs.meta.total)} of{' '}
								{faqs.meta.total} results
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
									Page {faqs.meta.page} of {faqs.meta.lastPage}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(Math.min(faqs.meta.lastPage, page + 1))}
									disabled={page === faqs.meta.lastPage}
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
				<FaqForm
					faq={selectedFaq}
					onSuccess={handleFormSuccess}
					onCancel={handleFormCancel}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete FAQ</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this FAQ? This action cannot be undone.
							<br />
							<strong>Question:</strong> {faqToDelete?.question}
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