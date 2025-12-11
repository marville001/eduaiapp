import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPromoBannersQueryDto } from './dto';
import { PromoBanner } from './entities/promo-banner.entity';

@Injectable()
export class PromoBannerRepository extends AbstractRepository<PromoBanner> {
	constructor(
		@InjectRepository(PromoBanner)
		private readonly promoBannerRepository: Repository<PromoBanner>,
	) {
		super(promoBannerRepository);
	}

	/**
	 * Get promo banners with filtering and pagination
	 */
	async getPromoBanners(query: GetPromoBannersQueryDto): Promise<{
		data: PromoBanner[];
		total: number;
		page: number;
		limit: number;
	}> {
		const {
			activeOnly = 'false',
			placement,
			search,
			page = 1,
			limit = 10,
			sortBy = 'sortOrder',
			sortOrder = 'ASC'
		} = query;

		const queryBuilder = this.promoBannerRepository
			.createQueryBuilder('promo_banner')
			.where('promo_banner.deletedAt IS NULL');

		// Apply filters
		if (activeOnly === 'true') {
			queryBuilder.andWhere('promo_banner.isActive = :isActive', { isActive: true });
		}

		if (placement) {
			queryBuilder.andWhere('promo_banner.placement = :placement', { placement });
		}

		if (search) {
			queryBuilder.andWhere(
				'(promo_banner.title LIKE :search OR promo_banner.description LIKE :search)',
				{ search: `%${search}%` }
			);
		}

		// Apply sorting
		const allowedSortFields = ['sortOrder', 'title', 'placement', 'createdAt'];
		const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'sortOrder';
		queryBuilder.orderBy(`promo_banner.${sortField}`, sortOrder);

		// Get total count before pagination
		const total = await queryBuilder.getCount();

		// Apply pagination
		const skip = (page - 1) * limit;
		queryBuilder.skip(skip).take(limit);

		const data = await queryBuilder.getMany();

		return {
			data,
			total,
			page,
			limit,
		};
	}

	/**
	 * Get active promo banners for a specific placement
	 */
	async getActivePromoBanners(placement?: string): Promise<PromoBanner[]> {
		const queryBuilder = this.promoBannerRepository
			.createQueryBuilder('promo_banner')
			.where('promo_banner.isActive = :isActive', { isActive: true })
			.andWhere('promo_banner.deletedAt IS NULL')
			.orderBy('promo_banner.sortOrder', 'ASC');

		if (placement) {
			queryBuilder.andWhere('promo_banner.placement = :placement', { placement });
		}

		return queryBuilder.getMany();
	}
}
