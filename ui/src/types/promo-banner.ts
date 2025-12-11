// Promo Banner Types
export interface PromoBanner {
	id: number;
	title: string;
	description?: string;
	imageUrl?: string;
	buttonText: string;
	buttonUrl: string;
	buttonVariant: string;
	isActive: boolean;
	sortOrder: number;
	placement: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

// Create DTOs
export interface CreatePromoBannerData {
	title: string;
	description?: string;
	imageUrl?: string;
	buttonText: string;
	buttonUrl: string;
	buttonVariant?: string;
	isActive?: boolean;
	sortOrder?: number;
	placement?: string;
}

// Update DTOs
export interface UpdatePromoBannerData {
	title?: string;
	description?: string;
	imageUrl?: string;
	buttonText?: string;
	buttonUrl?: string;
	buttonVariant?: string;
	isActive?: boolean;
	sortOrder?: number;
	placement?: string;
}

// Query DTOs
export interface GetPromoBannersParams {
	activeOnly?: boolean;
	placement?: string;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

// Filter interface for admin UI
export interface PromoBannerFilters {
	search?: string;
	placement?: string;
	isActive?: boolean;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

// API Response types
export interface PromoBannerResponse {
	data: PromoBanner[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Placement options
export const BANNER_PLACEMENTS = [
	{ value: 'ai-tutor', label: 'AI Tutor Page' },
	{ value: 'homepage', label: 'Homepage' },
	{ value: 'subjects', label: 'Subjects Page' },
] as const;

// Button variant options
export const BUTTON_VARIANTS = [
	{ value: 'primary', label: 'Primary' },
	{ value: 'secondary', label: 'Secondary' },
	{ value: 'outline', label: 'Outline' },
	{ value: 'ghost', label: 'Ghost' },
] as const;
