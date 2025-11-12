"use client";

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { navbarMenuApi } from '@/lib/api/navbar-menu.api';
import { NavbarMenu } from '@/types/navbar-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255),
	slug: z.string().min(1, 'Slug is required').max(255),
	url: z.string().optional(),
	parentId: z.string().optional(),
	isActive: z.boolean(),
	sortOrder: z.number().min(0),
	target: z.enum(['_self', '_blank', '_parent', '_top']),
	icon: z.string().optional(),
	description: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface NavbarMenuFormProps {
	menu?: NavbarMenu | null;
	onClose: () => void;
	onSuccess: () => void;
}

export function NavbarMenuForm({ menu, onClose, onSuccess }: NavbarMenuFormProps) {
	const [loading, setLoading] = useState(false);
	const [availableMenus, setAvailableMenus] = useState<NavbarMenu[]>([]);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors }
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			slug: '',
			url: '',
			parentId: '',
			isActive: true,
			sortOrder: 0,
			target: '_self',
			icon: '',
			description: ''
		}
	});

	const watchedTitle = watch('title');

	useEffect(() => {
		// Load available menus for parent selection
		const loadMenus = async () => {
			try {
				const menus = await navbarMenuApi.getHierarchical(false);
				setAvailableMenus(menus);
			} catch (error) {
				console.error('Failed to load menus:', error);
				toast.error('Failed to load menus');
			}
		};
		loadMenus();
	}, []);

	useEffect(() => {
		if (menu) {
			reset({
				title: menu.title,
				slug: menu.slug,
				url: menu.url || '',
				parentId: (menu.parentId || '') + "",
				isActive: menu.isActive,
				sortOrder: menu.sortOrder,
				target: menu.target as '_self' | '_blank' | '_parent' | '_top',
				icon: menu.icon || '',
				description: menu.description || ''
			});
		}
	}, [menu, reset]);

	useEffect(() => {
		if (!menu && watchedTitle) {
			const slug = watchedTitle
				.toLowerCase()
				.replace(/[^a-z0-9 -]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim()
				.replace(/^-+|-+$/g, '');
			setValue('slug', slug);
		}
	}, [watchedTitle, menu, setValue]);

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		setLoading(true);
		try {
			const menuData = {
				title: data.title,
				slug: data.slug,
				url: data.url || undefined,
				parentId: data.parentId || undefined,
				isActive: data.isActive,
				sortOrder: data.sortOrder,
				target: data.target,
				icon: data.icon || undefined,
				description: data.description || undefined
			};

			if (menu) {
				await navbarMenuApi.update(menu.id + "", menuData);
				toast.success('Menu updated successfully');
			} else {
				await navbarMenuApi.create(menuData);
				toast.success('Menu created successfully');
			}

			onSuccess();
		} catch (error: unknown) {
			let message = menu ? 'Failed to update menu' : 'Failed to create menu';

			if (error && typeof error === 'object' && 'response' in error) {
				const response = (error as { response?: { data?: { message?: string; }; }; }).response;
				if (response?.data?.message) {
					message = response.data.message;
				}
			}

			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const renderMenuOptions = (menus: NavbarMenu[], level: number = 0): React.ReactNode[] => {
		const options: React.ReactNode[] = [];

		for (const menuOption of menus) {
			// Don't allow selecting self or descendants as parent
			if (menu && (menuOption.id === menu.id)) {
				continue;
			}

			options.push(
				<SelectItem key={menuOption.id} value={menuOption.id + ""}>
					{'  '.repeat(level) + menuOption.title}
				</SelectItem>
			);

			if (menuOption.children && menuOption.children.length > 0) {
				options.push(...renderMenuOptions(menuOption.children, level + 1));
			}
		}

		return options;
	};

	console.log({ errors });


	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{menu ? 'Edit Menu' : 'Create New Menu'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								placeholder="Enter menu title"
								{...register('title')}
							/>
							{errors.title && (
								<p className="text-sm text-red-600">{errors.title.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="slug">Slug *</Label>
							<Input
								id="slug"
								placeholder="enter-menu-slug"
								{...register('slug')}
							/>
							{errors.slug && (
								<p className="text-sm text-red-600">{errors.slug.message}</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="url">URL</Label>
						<Input
							id="url"
							placeholder="/path/to/page or https://example.com"
							{...register('url')}
						/>
						{errors.url && (
							<p className="text-sm text-red-600">{errors.url.message}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="parentId">Parent Menu</Label>
							<Select
								onValueChange={(value) => {
									setValue('parentId', value === 'none' ? '' : value);
								}}
								defaultValue=""
							>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder="Select parent menu (optional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None (Top Level)</SelectItem>
									{renderMenuOptions(availableMenus)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="target">Target</Label>
							<Select
								onValueChange={(value) => setValue('target', value as FormData['target'])}
								defaultValue="_self"
							>
								<SelectTrigger className='w-full'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="_self">Same Window</SelectItem>
									<SelectItem value="_blank">New Window</SelectItem>
									<SelectItem value="_parent">Parent Frame</SelectItem>
									<SelectItem value="_top">Full Window</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="sortOrder">Sort Order</Label>
							<Input
								id="sortOrder"
								type="number"
								min="0"
								{...register('sortOrder', { valueAsNumber: true })}
							/>
							{errors.sortOrder && (
								<p className="text-sm text-red-600">{errors.sortOrder.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="icon">Icon</Label>
							<Input
								id="icon"
								placeholder="icon-name or CSS class"
								{...register('icon')}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Optional description for this menu"
							rows={3}
							{...register('description')}
						/>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">Active</Label>
							<div className="text-sm text-muted-foreground">
								Enable this menu item to appear in navigation
							</div>
						</div>
						<Switch
							onCheckedChange={(checked) => setValue('isActive', checked)}
							defaultChecked={true}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : (menu ? 'Update Menu' : 'Create Menu')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}