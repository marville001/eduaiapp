// Footer Menu Types
export interface FooterColumn {
	id: number;
	columnId: string;
	title: string;
	slug: string;
	description?: string;
	isActive: boolean;
	sortOrder: number;
	items?: FooterItem[];
	createdAt: string;
	updatedAt: string;
}

export interface FooterItem {
	id: number;
	itemId: string;
	title: string;
	slug: string;
	url?: string;
	target: string;
	icon?: string;
	description?: string;
	isActive: boolean;
	sortOrder: number;
	columnId: string;
	column?: FooterColumn;
	createdAt: string;
	updatedAt: string;
}

// Create DTOs
export interface CreateFooterColumnData {
	title: string;
	slug: string;
	description?: string;
	isActive?: boolean;
	sortOrder?: number;
}

export interface CreateFooterItemData {
	title: string;
	slug: string;
	url?: string;
	target?: string;
	icon?: string;
	description?: string;
	isActive?: boolean;
	sortOrder?: number;
	columnId: string;
}

// Update DTOs
export interface UpdateFooterColumnData {
	title?: string;
	slug?: string;
	description?: string;
	isActive?: boolean;
	sortOrder?: number;
}

export interface UpdateFooterItemData {
	title?: string;
	slug?: string;
	url?: string;
	target?: string;
	icon?: string;
	description?: string;
	isActive?: boolean;
	sortOrder?: number;
	columnId?: string;
}

// Query DTOs
export interface GetFooterColumnsParams {
	activeOnly?: boolean;
	includeItems?: boolean;
	page?: number;
	limit?: number;
	search?: string;
}

export interface GetFooterItemsParams {
	activeOnly?: boolean;
	columnId?: string;
	page?: number;
	limit?: number;
	search?: string;
}

// API Response types
export interface FooterColumnResponse {
	data: FooterColumn[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface FooterItemResponse {
	data: FooterItem[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Error types
export interface FooterMenuError {
	message: string;
	statusCode: number;
	error?: string;
}