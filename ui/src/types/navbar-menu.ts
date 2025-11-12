export interface NavbarMenu {
	id: number;
	menuId: string;
	title: string;
	slug: string;
	url?: string;
	isActive: boolean;
	sortOrder: number;
	parentId?: string;
	parent?: NavbarMenu;
	children?: NavbarMenu[];
	target: string;
	icon?: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateNavbarMenuRequest {
	title: string;
	slug: string;
	url?: string;
	parentId?: string;
	isActive?: boolean;
	sortOrder?: number;
	target?: string;
	icon?: string;
	description?: string;
}

export interface UpdateNavbarMenuRequest {
	title?: string;
	slug?: string;
	url?: string;
	parentId?: string;
	isActive?: boolean;
	sortOrder?: number;
	target?: string;
	icon?: string;
	description?: string;
}

export interface GetNavbarMenusRequest {
	activeOnly?: boolean;
	includeChildren?: boolean;
	parentId?: string;
	page?: number;
	limit?: number;
	search?: string;
}

export interface NavbarMenusResponse {
	data: NavbarMenu[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface ReorderMenusRequest {
	parentId: string | null;
	menuIds: string[];
}