// Testimonial Types
export interface Testimonial {
	testimonialId: string;
	customerName: string;
	customerTitle?: string;
	customerEmail?: string;
	customerCompany?: string;
	customerImage?: string;
	content: string;
	rating: number;
	isActive: boolean;
	isFeatured: boolean;
	sortOrder: number;
	category: string;
	testimonialDate?: string;
	videoUrl?: string;
	sourceUrl?: string;
	createdAt: string;
	updatedAt: string;
}

// Create DTOs
export interface CreateTestimonialData {
	customerName: string;
	customerTitle?: string;
	customerEmail?: string;
	customerCompany?: string;
	customerImage?: string;
	content: string;
	rating?: number;
	isActive?: boolean;
	isFeatured?: boolean;
	sortOrder?: number;
	category?: string;
	testimonialDate?: string;
	videoUrl?: string;
	sourceUrl?: string;
}

// Update DTOs
export interface UpdateTestimonialData {
	customerName?: string;
	customerTitle?: string;
	customerCompany?: string;
	customerImage?: string;
	content?: string;
	rating?: number;
	isActive?: boolean;
	isFeatured?: boolean;
	sortOrder?: number;
	category?: string;
	testimonialDate?: string;
	videoUrl?: string;
	sourceUrl?: string;
}

// Query DTOs
export interface GetTestimonialsParams {
	activeOnly?: boolean;
	featuredOnly?: boolean;
	category?: string;
	page?: number;
	limit?: number;
	search?: string;
}

// API Response types
export interface TestimonialResponse {
	data: Testimonial[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Testimonial categories
export const TESTIMONIAL_CATEGORIES = [
	'general',
	'course',
	'support',
	'platform',
	'instructor',
] as const;

export const TESTIMONIAL_RATINGS = [1, 2, 3, 4, 5] as const;

export type TestimonialCategory = typeof TESTIMONIAL_CATEGORIES[number];

// Rating constants
export const RATING_LABELS = {
	1: 'Poor',
	2: 'Fair',
	3: 'Good',
	4: 'Very Good',
	5: 'Excellent',
} as const;