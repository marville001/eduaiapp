"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NavbarMenu } from '@/types/navbar-menu';

interface DeleteConfirmDialogProps {
	menu: NavbarMenu;
	onClose: () => void;
	onConfirm: () => void;
}

export function DeleteConfirmDialog({ menu, onClose, onConfirm }: DeleteConfirmDialogProps) {
	return (
		<AlertDialog open onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Menu</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete the menu &quot;{menu.title}&quot;?
						{menu.children && menu.children.length > 0 && (
							<span className="block mt-2 text-red-600 font-medium">
								Warning: This menu has {menu.children.length} child menu(s). You must delete or move
								the child menus first before deleting this parent menu.
							</span>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-red-600 hover:bg-red-700"
						disabled={menu.children && menu.children.length > 0}
					>
						Delete Menu
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}