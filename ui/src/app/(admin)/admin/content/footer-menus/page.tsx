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
import { footerColumnApi, footerItemApi } from '@/lib/api/footer-menu.api';
import { FooterColumn, FooterItem } from '@/types/footer-menu';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Edit, Eye, EyeOff, MoreHorizontal, Plus, Search, ToggleRight, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from "sonner";
import { DeleteConfirmDialog } from './components/delete-confirm-dialog';
import { FooterColumnForm } from './components/footer-column-form';
import { FooterItemForm } from './components/footer-item-form';

export default function FooterMenusPage() {
	const [columns, setColumns] = useState<FooterColumn[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	// Selection states
	const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

	// Expanded columns for showing items
	const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

	// Form and dialog states
	const [showColumnForm, setShowColumnForm] = useState(false);
	const [showItemForm, setShowItemForm] = useState(false);
	const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
	const [editingItem, setEditingItem] = useState<FooterItem | null>(null);
	const [deletingColumn, setDeletingColumn] = useState<FooterColumn | null>(null);
	const [deletingItem, setDeletingItem] = useState<FooterItem | null>(null);
	const [itemColumnId, setItemColumnId] = useState<string>('');

	// Fetch columns with items
	const fetchColumns = useCallback(async () => {
		try {
			setLoading(true);
			const response = await footerColumnApi.getAll({ includeItems: true });
			// Handle both array response and paginated response
			const columns = Array.isArray(response) ? response : response.data;
			setColumns(columns);
		} catch {
			toast.error('Failed to fetch footer columns');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchColumns();
	}, [fetchColumns]);

	// Filter columns based on search
	const filteredColumns = columns.filter(column =>
		column.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
		column.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
		column.items?.some(item =>
			item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.slug.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	// Column handlers
	const handleCreateColumn = () => {
		setEditingColumn(null);
		setShowColumnForm(true);
	};

	const handleEditColumn = (column: FooterColumn) => {
		setEditingColumn(column);
		setShowColumnForm(true);
	};

	const handleDeleteColumn = (column: FooterColumn) => {
		setDeletingColumn(column);
	};

	const confirmDeleteColumn = async () => {
		if (!deletingColumn) return;

		try {
			await footerColumnApi.delete(deletingColumn.id + "");
			toast.success('Column deleted successfully');
			await fetchColumns();
		} catch {
			toast.error('Failed to delete column');
		} finally {
			setDeletingColumn(null);
		}
	};

	const handleToggleColumnActive = async (column: FooterColumn) => {
		try {
			await footerColumnApi.toggleActive(column.id + "");
			toast.success(`Column ${column.isActive ? 'deactivated' : 'activated'} successfully`);
			await fetchColumns();
		} catch {
			toast.error('Failed to update column status');
		}
	};

	const handleMoveColumnSortOrder = async (column: FooterColumn, direction: 'up' | 'down') => {
		try {
			const newSortOrder = direction === 'up' ? column.sortOrder - 1 : column.sortOrder + 1;
			await footerColumnApi.updateSortOrder(column.id + "", Math.max(0, newSortOrder));
			toast.success('Sort order updated successfully');
			await fetchColumns();
		} catch {
			toast.error('Failed to update sort order');
		}
	};

	// Item handlers
	const handleCreateItem = (columnId: string) => {
		setItemColumnId(columnId);
		setEditingItem(null);
		setShowItemForm(true);
	};

	const handleEditItem = (item: FooterItem) => {
		setEditingItem(item);
		setItemColumnId(item.id + "");
		setShowItemForm(true);
	};

	const handleDeleteItem = (item: FooterItem) => {
		setDeletingItem(item);
	};

	const confirmDeleteItem = async () => {
		if (!deletingItem) return;

		try {
			await footerItemApi.delete(deletingItem.id + "");
			toast.success('Item deleted successfully');
			await fetchColumns();
		} catch {
			toast.error('Failed to delete item');
		} finally {
			setDeletingItem(null);
		}
	};

	const handleToggleItemActive = async (item: FooterItem) => {
		try {
			await footerItemApi.toggleActive(item.id + "");
			toast.success(`Item ${item.isActive ? 'deactivated' : 'activated'} successfully`);
			await fetchColumns();
		} catch {
			toast.error('Failed to update item status');
		}
	};

	const handleMoveItemSortOrder = async (item: FooterItem, direction: 'up' | 'down') => {
		try {
			const newSortOrder = direction === 'up' ? item.sortOrder - 1 : item.sortOrder + 1;
			await footerItemApi.updateSortOrder(item.id + "", Math.max(0, newSortOrder));
			toast.success('Sort order updated successfully');
			await fetchColumns();
		} catch {
			toast.error('Failed to update sort order');
		}
	};

	// Selection handlers
	const toggleColumnSelection = (columnId: string) => {
		const newSelection = new Set(selectedColumns);
		if (newSelection.has(columnId)) {
			newSelection.delete(columnId);
		} else {
			newSelection.add(columnId);
		}
		setSelectedColumns(newSelection);
	};

	const toggleItemSelection = (itemId: string) => {
		const newSelection = new Set(selectedItems);
		if (newSelection.has(itemId)) {
			newSelection.delete(itemId);
		} else {
			newSelection.add(itemId);
		}
		setSelectedItems(newSelection);
	};

	const toggleAllColumnsSelection = () => {
		if (selectedColumns.size === filteredColumns.length) {
			setSelectedColumns(new Set());
		} else {
			setSelectedColumns(new Set(filteredColumns.map(col => col.columnId)));
		}
	};

	// Bulk operations
	const handleBulkToggleColumns = async () => {
		const columnIds = Array.from(selectedColumns);
		try {
			await Promise.all(columnIds.map(id => footerColumnApi.toggleActive(id)));
			toast.success(`Updated ${columnIds.length} column(s) successfully`);
			await fetchColumns();
			setSelectedColumns(new Set());
		} catch {
			toast.error('Failed to update columns');
		}
	};

	const handleBulkToggleItems = async () => {
		const itemIds = Array.from(selectedItems);
		try {
			await footerItemApi.bulkToggleActive(itemIds);
			toast.success(`Updated ${itemIds.length} item(s) successfully`);
			await fetchColumns();
			setSelectedItems(new Set());
		} catch {
			toast.error('Failed to update items');
		}
	};

	// Expand/collapse
	const toggleExpanded = (columnId: string) => {
		const newExpanded = new Set(expandedColumns);
		if (newExpanded.has(columnId)) {
			newExpanded.delete(columnId);
		} else {
			newExpanded.add(columnId);
		}
		setExpandedColumns(newExpanded);
	};

	const handleFormSuccess = async () => {
		setShowColumnForm(false);
		setShowItemForm(false);
		setEditingColumn(null);
		setEditingItem(null);
		await fetchColumns();
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Footer Menus</h1>
					<p className="text-gray-600">Manage footer menu columns and items</p>
				</div>
				<div className="flex items-center gap-2">
					{selectedColumns.size > 0 && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={handleBulkToggleColumns}
							>
								<ToggleRight className="w-4 h-4 mr-2" />
								Toggle Columns ({selectedColumns.size})
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedColumns(new Set())}
							>
								Clear Selection
							</Button>
						</>
					)}
					{selectedItems.size > 0 && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={handleBulkToggleItems}
							>
								<ToggleRight className="w-4 h-4 mr-2" />
								Toggle Items ({selectedItems.size})
							</Button>
						</>
					)}
					<Button onClick={handleCreateColumn}>
						<Plus className="w-4 h-4 mr-2" />
						Add Column
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Footer Menu Columns</CardTitle>
					<div className="flex items-center gap-4">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search columns and items..."
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
					) : filteredColumns.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">
								{searchTerm ? 'No columns found matching your search.' : 'No footer columns found.'}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={selectedColumns.size === filteredColumns.length}
											onCheckedChange={toggleAllColumnsSelection}
										/>
									</TableHead>
									<TableHead>Column</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>Items</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-center">Sort Order</TableHead>
									<TableHead className="w-32">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredColumns.map((column) => (
									<React.Fragment key={column.columnId}>
										{/* Column Row */}
										<TableRow className="group">
											<TableCell>
												<Checkbox
													checked={selectedColumns.has(column.id + "")}
													onCheckedChange={() => toggleColumnSelection(column.id + "")}
												/>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{column.items && column.items.length > 0 && (
														<Button
															variant="ghost"
															size="sm"
															className="h-6 w-6 p-0"
															onClick={() => toggleExpanded(column.id + "")}
														>
															{expandedColumns.has(column.id + "") ? (
																<ChevronDown className="h-4 w-4" />
															) : (
																<ChevronRight className="h-4 w-4" />
															)}
														</Button>
													)}
													<div>
														<div className="font-medium">{column.title}</div>
														{column.description && (
															<div className="text-sm text-gray-500">{column.description}</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<code className="text-sm bg-gray-100 px-2 py-1 rounded">{column.slug}</code>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<span>{column.items?.length || 0}</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleCreateItem(column.id + "")}
													>
														<Plus className="h-3 w-3 mr-1" />
														Add Item
													</Button>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={column.isActive ? 'default' : 'secondary'}>
													{column.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</TableCell>
											<TableCell className="text-center">
												<div className="flex items-center justify-center gap-1">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleMoveColumnSortOrder(column, 'up')}
														disabled={column.sortOrder <= 0}
														className="h-6 w-6 p-0"
													>
														<ArrowUp className="h-3 w-3" />
													</Button>
													<span className="mx-2">{column.sortOrder}</span>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleMoveColumnSortOrder(column, 'down')}
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
														<DropdownMenuItem onClick={() => handleEditColumn(column)}>
															<Edit className="w-4 h-4 mr-2" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleToggleColumnActive(column)}>
															{column.isActive ? (
																<EyeOff className="w-4 h-4 mr-2" />
															) : (
																<Eye className="w-4 h-4 mr-2" />
															)}
															{column.isActive ? 'Deactivate' : 'Activate'}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDeleteColumn(column)}
															className="text-red-600"
														>
															<Trash2 className="w-4 h-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>

										{/* Items Rows */}
										{expandedColumns.has(column.id + "") && column.items?.map((item) => (
											<TableRow key={item.itemId} className="bg-gray-50">
												<TableCell>
													<Checkbox
														checked={selectedItems.has(item.id + "")}
														onCheckedChange={() => toggleItemSelection(item.id + "")}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2 pl-8">
														<div>
															<div className="font-medium">{item.title}</div>
															{item.description && (
																<div className="text-sm text-gray-500">{item.description}</div>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<code className="text-sm bg-gray-200 px-2 py-1 rounded">{item.slug}</code>
												</TableCell>
												<TableCell>
													{item.url ? (
														<a
															href={item.url}
															target={item.target}
															className="text-blue-600 hover:underline text-sm"
														>
															{item.url}
														</a>
													) : (
														<span className="text-gray-400 text-sm">No URL</span>
													)}
												</TableCell>
												<TableCell>
													<Badge variant={item.isActive ? 'default' : 'secondary'} className="text-xs">
														{item.isActive ? 'Active' : 'Inactive'}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<div className="flex items-center justify-center gap-1">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleMoveItemSortOrder(item, 'up')}
															disabled={item.sortOrder <= 0}
															className="h-6 w-6 p-0"
														>
															<ArrowUp className="h-3 w-3" />
														</Button>
														<span className="mx-2 text-sm">{item.sortOrder}</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleMoveItemSortOrder(item, 'down')}
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
															<DropdownMenuItem onClick={() => handleEditItem(item)}>
																<Edit className="w-4 h-4 mr-2" />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleToggleItemActive(item)}>
																{item.isActive ? (
																	<EyeOff className="w-4 h-4 mr-2" />
																) : (
																	<Eye className="w-4 h-4 mr-2" />
																)}
																{item.isActive ? 'Deactivate' : 'Activate'}
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleDeleteItem(item)}
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
									</React.Fragment>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Column Form Dialog */}
			{showColumnForm && (
				<FooterColumnForm
					column={editingColumn}
					onSuccess={handleFormSuccess}
					onCancel={() => {
						setShowColumnForm(false);
						setEditingColumn(null);
					}}
				/>
			)}

			{/* Item Form Dialog */}
			{showItemForm && (
				<FooterItemForm
					item={editingItem}
					columnId={itemColumnId}
					columns={columns}
					onSuccess={handleFormSuccess}
					onCancel={() => {
						setShowItemForm(false);
						setEditingItem(null);
					}}
				/>
			)}

			{/* Delete Confirmation Dialogs */}
			<DeleteConfirmDialog
				open={!!deletingColumn}
				onOpenChange={() => setDeletingColumn(null)}
				onConfirm={confirmDeleteColumn}
				title="Delete Column"
				description={`Are you sure you want to delete the column "${deletingColumn?.title}"? This action cannot be undone and will also delete all items in this column.`}
				itemName={deletingColumn?.title}
			/>

			<DeleteConfirmDialog
				open={!!deletingItem}
				onOpenChange={() => setDeletingItem(null)}
				onConfirm={confirmDeleteItem}
				title="Delete Item"
				description={`Are you sure you want to delete the item "${deletingItem?.title}"? This action cannot be undone.`}
				itemName={deletingItem?.title}
			/>
		</div>
	);
}