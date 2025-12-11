import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePromoBannerDto, GetPromoBannersQueryDto, UpdatePromoBannerDto } from './dto';
import { PromoBanner } from './entities/promo-banner.entity';
import { PromoBannerRepository } from './promo-banner.repository';

@Injectable()
export class PromoBannerService {
	constructor(private readonly promoBannerRepository: PromoBannerRepository) { }

	/**
	 * Create a new promo banner
	 */
	async createPromoBanner(createPromoBannerDto: CreatePromoBannerDto): Promise<PromoBanner> {
		try {
			const promoBanner = new PromoBanner({
				...createPromoBannerDto,
			});

			return this.promoBannerRepository.save(promoBanner);
		} catch (error) {
			throw new BadRequestException('Failed to create promo banner');
		}
	}

	/**
	 * Get all promo banners with filtering and pagination
	 */
	async getAllPromoBanners(query: GetPromoBannersQueryDto): Promise<{
		data: PromoBanner[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		const result = await this.promoBannerRepository.getPromoBanners(query);
		const totalPages = Math.ceil(result.total / result.limit);

		return {
			...result,
			totalPages,
		};
	}

	/**
	 * Get active promo banners for public use
	 */
	async getActivePromoBanners(placement?: string): Promise<PromoBanner[]> {
		return this.promoBannerRepository.getActivePromoBanners(placement);
	}

	/**
	 * Get promo banner by ID
	 */
	async getPromoBannerById(id: number): Promise<PromoBanner> {
		const promoBanner = await this.promoBannerRepository.findOne({ where: { id } });

		if (!promoBanner) {
			throw new NotFoundException('Promo banner not found');
		}

		return promoBanner;
	}

	/**
	 * Update an existing promo banner
	 */
	async updatePromoBanner(id: number, updatePromoBannerDto: UpdatePromoBannerDto): Promise<PromoBanner> {
		const promoBanner = await this.promoBannerRepository.findOne({ where: { id } });

		if (!promoBanner) {
			throw new NotFoundException('Promo banner not found');
		}

		Object.assign(promoBanner, updatePromoBannerDto);
		return this.promoBannerRepository.save(promoBanner);
	}

	/**
	 * Delete a promo banner (soft delete)
	 */
	async deletePromoBanner(id: number): Promise<void> {
		const promoBanner = await this.promoBannerRepository.findOne({ where: { id } });

		if (!promoBanner) {
			throw new NotFoundException('Promo banner not found');
		}

		promoBanner.deletedAt = new Date();
		await this.promoBannerRepository.save(promoBanner);
	}

	/**
	 * Toggle active status of a promo banner
	 */
	async toggleActiveStatus(id: number): Promise<PromoBanner> {
		const promoBanner = await this.promoBannerRepository.findOne({ where: { id } });

		if (!promoBanner) {
			throw new NotFoundException('Promo banner not found');
		}

		promoBanner.isActive = !promoBanner.isActive;
		return this.promoBannerRepository.save(promoBanner);
	}

	/**
	 * Update sort order of promo banners
	 */
	async updateSortOrder(items: { id: number; sortOrder: number; }[]): Promise<void> {
		for (const item of items) {
			await this.promoBannerRepository.update({ id: item.id }, { sortOrder: item.sortOrder });
		}
	}
}
