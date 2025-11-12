// FAQ Types
export interface Faq {
	id: number;
	question: string;
	answer: string;
	isActive: boolean;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

// Create DTOs
export interface CreateFaqData {
	question: string;
	answer: string;
	isActive?: boolean;
	sortOrder?: number;
}

// Update DTOs
export interface UpdateFaqData {
	question?: string;
	answer?: string;
	isActive?: boolean;
	sortOrder?: number;
}

// Query DTOs
export interface GetFaqsParams {
	activeOnly?: boolean;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

// Filter interface for admin UI
export interface FaqFilters {
	search?: string;
	isActive?: boolean;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

// API Response types
export interface FaqResponse {
	data: Faq[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}