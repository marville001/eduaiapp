import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialRepository } from './testimonial.repository';

@Injectable()
export class TestimonialService {
	constructor(private readonly testimonialRepository: TestimonialRepository) { }

	async create(createTestimonialDto: CreateTestimonialDto): Promise<Testimonial> {
		// Validate rating range
		if (createTestimonialDto.rating && (createTestimonialDto.rating < 1 || createTestimonialDto.rating > 5)) {
			throw new BadRequestException('Rating must be between 1 and 5');
		}

		// Set sort order if not provided
		if (createTestimonialDto.sortOrder === undefined) {
			const maxSortOrder = await this.testimonialRepository.getMaxSortOrder();
			createTestimonialDto.sortOrder = maxSortOrder + 1;
		}

		const testimonial = new Testimonial(createTestimonialDto);
		return this.testimonialRepository.create(testimonial);
	}

	async findAll(query: GetTestimonialsDto) {
		const { page, limit } = query;

		const result = await this.testimonialRepository.findAllWithFilters(query);

		if (page && limit) {
			const totalPages = Math.ceil(result.total / limit);
			return {
				data: result.data,
				pagination: {
					page,
					limit,
					total: result.total,
					totalPages,
				},
			};
		}

		return { data: result.data };
	}

	async findOne(testimonialId: string): Promise<Testimonial> {
		const testimonial = await this.testimonialRepository.findByTestimonialId(testimonialId);
		if (!testimonial) {
			throw new NotFoundException(`Testimonial with ID '${testimonialId}' not found`);
		}
		return testimonial;
	}

	async update(testimonialId: string, updateTestimonialDto: UpdateTestimonialDto): Promise<Testimonial> {
		const testimonial = await this.findOne(testimonialId);

		// Validate rating range
		if (updateTestimonialDto.rating && (updateTestimonialDto.rating < 1 || updateTestimonialDto.rating > 5)) {
			throw new BadRequestException('Rating must be between 1 and 5');
		}

		Object.assign(testimonial, updateTestimonialDto);
		return this.testimonialRepository.save(testimonial);
	}

	async remove(testimonialId: string): Promise<void> {
		const testimonial = await this.findOne(testimonialId);
		await this.testimonialRepository.delete(testimonial.id);
	}

	async toggleActive(testimonialId: string): Promise<Testimonial> {
		const testimonial = await this.findOne(testimonialId);
		testimonial.isActive = !testimonial.isActive;
		return this.testimonialRepository.save(testimonial);
	}

	async toggleFeatured(testimonialId: string): Promise<Testimonial> {
		const testimonial = await this.findOne(testimonialId);
		testimonial.isFeatured = !testimonial.isFeatured;
		return this.testimonialRepository.save(testimonial);
	}

	async updateSortOrder(testimonialId: string, newSortOrder: number): Promise<Testimonial> {
		const testimonial = await this.findOne(testimonialId);
		testimonial.sortOrder = Math.max(0, newSortOrder);
		return this.testimonialRepository.save(testimonial);
	}

	async getActiveTestimonials(): Promise<Testimonial[]> {
		return this.testimonialRepository.findAllActive();
	}

	async getFeaturedTestimonials(): Promise<Testimonial[]> {
		return this.testimonialRepository.findFeatured();
	}

	async getCategories(): Promise<string[]> {
		return this.testimonialRepository.getCategories();
	}

	async bulkToggleActive(testimonialIds: string[]): Promise<Testimonial[]> {
		const testimonials = await Promise.all(
			testimonialIds.map(id => this.toggleActive(id))
		);
		return testimonials;
	}

	async bulkToggleFeatured(testimonialIds: string[]): Promise<Testimonial[]> {
		const testimonials = await Promise.all(
			testimonialIds.map(id => this.toggleFeatured(id))
		);
		return testimonials;
	}
}