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
import { navbarMenuApi } from '@/lib/api/navbar-menu.api';
import { NavbarMenu } from '@/types/navbar-menu';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Edit, Expand, Eye, EyeOff, ListCollapse, MoreHorizontal, Plus, Search, ToggleRight, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from "sonner";
import { DeleteConfirmDialog } from './components/delete-confirm-dialog';
import { NavbarMenuForm } from './components/navbar-menu-form';

export default function NavbarMenusPage() {
	const [menus, setMenus] = useState<NavbarMenu[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [showForm, setShowForm] = useState(false);
	const [editingMenu, setEditingMenu] = useState<NavbarMenu | null>(null);
	const [deletingMenu, setDeletingMenu] = useState<NavbarMenu | null>(null);
	const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
	const [menusLength, setMenusLength] = useState(0);
	const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());

	const fetchMenus = useCallback(async () => {
		try {
			setLoading(true);
			const data = await navbarMenuApi.getHierarchical(false);
			setMenusLength(data.length);
			setMenus(data);
		} catch {
			toast.error('Failed to fetch navbar menus');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMenus();
	}, [fetchMenus]);

	const handleCreate = () => {
		setEditingMenu(null);
		setShowForm(true);
	};

	const handleEdit = (menu: NavbarMenu) => {
		setEditingMenu(menu);
		setShowForm(true);
	};

	const handleDelete = (menu: NavbarMenu) => {
		setDeletingMenu(menu);
	};

	const confirmDelete = async () => {
		if (!deletingMenu) return;

		try {
			await navbarMenuApi.delete(deletingMenu.id + "");
			toast.success('Menu deleted successfully');
			await fetchMenus();
		} catch {
			toast.error('Failed to delete menu');
		} finally {
			setDeletingMenu(null);
		}
	};

	const handleToggleActive = async (menu: NavbarMenu) => {
		try {
			await navbarMenuApi.toggleActive(menu.menuId);
			toast.success(`Menu ${menu.isActive ? 'deactivated' : 'activated'} successfully`);
			await fetchMenus();
		} catch {
			toast.error('Failed to update menu status');
		}
	};

	const handleMoveSortOrder = async (menu: NavbarMenu, direction: 'up' | 'down') => {
		try {
			const newSortOrder = direction === 'up' ? menu.sortOrder - 1 : menu.sortOrder + 1;
			await navbarMenuApi.updateSortOrder(menu.id + "", Math.max(0, newSortOrder));
			toast.success('Sort order updated successfully');
			await fetchMenus();
		} catch {
			toast.error('Failed to update sort order');
		}
	};

	const handleBulkToggleActive = async (menuIds: string[]) => {
		try {
			await Promise.all(menuIds.map(id => navbarMenuApi.toggleActive(id)));
			toast.success(`Updated ${menuIds.length} menu(s) successfully`);
			await fetchMenus();
		} catch {
			toast.error('Failed to update menus');
		}
	};

	const toggleMenuSelection = (menuId: string) => {
		const newSelected = new Set(selectedMenus);
		if (newSelected.has(menuId)) {
			newSelected.delete(menuId);
		} else {
			newSelected.add(menuId);
		}
		setSelectedMenus(newSelected);
	};

	const selectAllVisibleMenus = () => {
		const allIds = new Set<string>();
		const addMenuIds = (menus: NavbarMenu[]) => {
			menus.forEach(menu => {
				allIds.add(menu.menuId);
				if (menu.children) {
					addMenuIds(menu.children);
				}
			});
		};
		addMenuIds(filteredMenus);
		setSelectedMenus(allIds);
	};

	const clearSelection = () => {
		setSelectedMenus(new Set());
	};

	const toggleExpanded = (menuId: string) => {
		const newExpanded = new Set(expandedMenus);
		if (newExpanded.has(menuId)) {
			newExpanded.delete(menuId);
		} else {
			newExpanded.add(menuId);
		}
		setExpandedMenus(newExpanded);
	};

	const renderMenuRow = (menu: NavbarMenu, level: number = 0) => {
		const hasChildren = menu.children && menu.children.length > 0;
		const isExpanded = expandedMenus.has(menu.menuId);
		const isSelected = selectedMenus.has(menu.menuId);

		return (
			<TableRow key={menu.menuId} className="group">
				<TableCell>
					<Checkbox
						checked={isSelected}
						onCheckedChange={() => toggleMenuSelection(menu.menuId)}
					/>
				</TableCell>
				<TableCell>
					<div className="flex items-center" style={{ paddingLeft: `${level * 12}px` }}>
						{hasChildren && (
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0 mr-2"
								onClick={() => toggleExpanded(menu.menuId)}
							>
								{isExpanded ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</Button>
						)}
						{!hasChildren && <div className="w-8" />}
						<div className="flex items-center gap-2">
							{/* <GripVertical className="h-4 w-4 text-gray-400" /> */}
							<span className="font-medium">{menu.title}</span>
						</div>
					</div>
				</TableCell>
				<TableCell>
					<code className="text-sm bg-gray-100 px-2 py-1 rounded">{menu.slug}</code>
				</TableCell>
				<TableCell>
					{menu.url ? (
						<a
							href={menu.url}
							target={menu.target}
							className="text-blue-600 hover:underline"
						>
							{menu.url}
						</a>
					) : (
						<span className="text-gray-400">-</span>
					)}
				</TableCell>
				<TableCell>
					<Badge variant={menu.isActive ? 'default' : 'secondary'}>
						{menu.isActive ? 'Active' : 'Inactive'}
					</Badge>
				</TableCell>
				<TableCell className="text-center">
					<div className="flex items-center justify-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleMoveSortOrder(menu, 'up')}
							disabled={menu.sortOrder <= 0}
							className="h-6 w-6 p-0"
						>
							<ArrowUp className="h-3 w-3" />
						</Button>
						<span className="mx-2">{menu.sortOrder}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleMoveSortOrder(menu, 'down')}
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
							<DropdownMenuItem onClick={() => handleEdit(menu)}>
								<Edit className="w-4 h-4 mr-2" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleToggleActive(menu)}>
								{menu.isActive ? (
									<EyeOff className="w-4 h-4 mr-2" />
								) : (
									<Eye className="w-4 h-4 mr-2" />
								)}
								{menu.isActive ? 'Deactivate' : 'Activate'}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleDelete(menu)}
								className="text-red-600"
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</TableCell>
			</TableRow>
		);
	};

	const renderMenuRows = (menus: NavbarMenu[], level: number = 0): React.ReactElement[] => {
		const rows: React.ReactElement[] = [];

		for (const menu of menus) {
			rows.push(renderMenuRow(menu, level));

			if (menu.children && menu.children.length > 0 && expandedMenus.has(menu.menuId)) {
				rows.push(...renderMenuRows(menu.children, level + 1));
			}
		}

		return rows;
	};

	const filteredMenus = menus.filter(menu => {
		const searchLower = searchQuery.toLowerCase();
		const matchesTitle = menu.title.toLowerCase().includes(searchLower);
		const matchesSlug = menu.slug.toLowerCase().includes(searchLower);
		const matchesUrl = menu.url?.toLowerCase().includes(searchLower) || false;

		return matchesTitle || matchesSlug || matchesUrl;
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Navbar Menus</h1>
					<p className="text-gray-600">Manage navigation menus for your website</p>
				</div>
				<div className="flex items-center gap-2">
					{selectedMenus.size > 0 && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleBulkToggleActive(Array.from(selectedMenus))}
							>
								<ToggleRight className="w-4 h-4 mr-2" />
								Toggle Active ({selectedMenus.size})
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedMenus(new Set())}
							>
								Clear Selection
							</Button>
						</>
					)}
					<Button onClick={handleCreate}>
						<Plus className="w-4 h-4 mr-2" />
						Add Menu
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Navbar Menus</CardTitle>
					<div className="flex items-center gap-4">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search menus..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const allIds = new Set<string>();
								const addAllMenuIds = (menus: NavbarMenu[]) => {
									menus.forEach(menu => {
										allIds.add(menu.menuId);
										if (menu.children) {
											addAllMenuIds(menu.children);
										}
									});
								};

								addAllMenuIds(menus);

								setMenusLength(allIds.size);
								if (allIds.size === expandedMenus.size) {
									setExpandedMenus(new Set());
									return;
								}

								setExpandedMenus(allIds);
							}}
						>
							{
								expandedMenus.size === menusLength ? <ListCollapse className="w-4 h-4 mr-2" /> : <Expand className="w-4 h-4 mr-2" />
							}
							{
								expandedMenus.size === menusLength ? 'Collapse All' : 'Expand All'
							}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{filteredMenus.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No menus found</p>
							<Button variant="outline" onClick={handleCreate} className="mt-4">
								<Plus className="w-4 h-4 mr-2" />
								Create your first menu
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={selectedMenus.size > 0 && selectedMenus.size === filteredMenus.length}
											onCheckedChange={(checked) => {
												if (checked) {
													selectAllVisibleMenus();
												} else {
													clearSelection();
												}
											}}
										/>
									</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>URL</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-center">Sort Order</TableHead>
									<TableHead className="w-32">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{renderMenuRows(filteredMenus)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{showForm && (
				<NavbarMenuForm
					menu={editingMenu}
					onClose={() => setShowForm(false)}
					onSuccess={() => {
						setShowForm(false);
						fetchMenus();
					}}
				/>
			)}

			{deletingMenu && (
				<DeleteConfirmDialog
					menu={deletingMenu}
					onClose={() => setDeletingMenu(null)}
					onConfirm={confirmDelete}
				/>
			)}
		</div>
	);
}