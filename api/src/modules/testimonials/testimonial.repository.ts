import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { Testimonial } from './entities/testimonial.entity';

@Injectable()
export class TestimonialRepository extends AbstractRepository<Testimonial> {
	constructor(
		@InjectRepository(Testimonial)
		private readonly testimonialRepository: Repository<Testimonial>,
	) {
		super(testimonialRepository);
	}

	async findAllWithFilters(query: GetTestimonialsDto): Promise<{ data: Testimonial[]; total: number; }> {
		const {
			activeOnly = "false",
			featuredOnly,
			category,
			page,
			limit,
			search
		} = query;

		const queryBuilder = this.testimonialRepository.createQueryBuilder('testimonial');

		if (activeOnly === 'true') {
			queryBuilder.andWhere('testimonial.isActive = :isActive', { isActive: true });
		}

		if (featuredOnly) {
			queryBuilder.andWhere('testimonial.isFeatured = :isFeatured', { isFeatured: true });
		}

		if (category) {
			queryBuilder.andWhere('testimonial.category = :category', { category });
		}

		if (search) {
			queryBuilder.andWhere(
				'(LOWER(testimonial.customerName) LIKE LOWER(:search) OR LOWER(testimonial.content) LIKE LOWER(:search) OR LOWER(testimonial.customerCompany) LIKE LOWER(:search))',
				{ search: `%${search}%` }
			);
		}

		queryBuilder.orderBy('testimonial.sortOrder', 'ASC')
			.addOrderBy('testimonial.createdAt', 'DESC');

		if (page && limit) {
			const skip = (page - 1) * limit;
			queryBuilder.skip(skip).take(limit);
		}

		const [data, total] = await queryBuilder.getManyAndCount();

		return { data, total };
	}

	async findByTestimonialId(testimonialId: string): Promise<Testimonial | null> {
		return this.testimonialRepository.findOne({
			where: { testimonialId }
		});
	}

	async getMaxSortOrder(): Promise<number> {
		const result = await this.testimonialRepository
			.createQueryBuilder('testimonial')
			.select('MAX(testimonial.sortOrder)', 'maxOrder')
			.getRawOne();

		return result?.maxOrder || 0;
	}

	async findAllActive(): Promise<Testimonial[]> {
		return this.testimonialRepository.find({
			where: { isActive: true },
			order: { sortOrder: 'ASC', createdAt: 'DESC' }
		});
	}

	async findFeatured(): Promise<Testimonial[]> {
		return this.testimonialRepository.find({
			where: { isActive: true, isFeatured: true },
			order: { sortOrder: 'ASC', createdAt: 'DESC' }
		});
	}

	async getCategories(): Promise<string[]> {
		const result = await this.testimonialRepository
			.createQueryBuilder('testimonial')
			.select('DISTINCT testimonial.category', 'category')
			.where('testimonial.isActive = :isActive', { isActive: true })
			.getRawMany();

		return result.map(r => r.category).filter(Boolean);
	}
}