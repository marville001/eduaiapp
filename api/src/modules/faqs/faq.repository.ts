import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFaqsQueryDto } from './dto';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqRepository extends AbstractRepository<Faq> {
	constructor(
		@InjectRepository(Faq)
		private readonly faqRepository: Repository<Faq>,
	) {
		super(faqRepository);
	}

	/**
	 * Get FAQs with filtering and pagination
	 */
	async getFaqs(query: GetFaqsQueryDto): Promise<{ data: Faq[]; total: number; page: number; limit: number; }> {
		const {
			activeOnly = "false",
			search,
			page = 1,
			limit = 10,
			sortBy = 'sortOrder',
			sortOrder = 'ASC'
		} = query;

		const queryBuilder = this.faqRepository
			.createQueryBuilder('faq')
			.where('faq.deletedAt IS NULL');

		// Apply filters
		if (activeOnly === 'true') {
			queryBuilder.andWhere('faq.isActive = :isActive', { isActive: true });
		}

		if (search) {
			queryBuilder.andWhere(
				'(faq.question LIKE :search OR faq.answer LIKE :search OR faq.tags LIKE :search)',
				{ search: `%${search}%` }
			);
		}

		// Apply sorting
		const allowedSortFields = ['sortOrder', 'question', 'category', 'priority', 'viewCount', 'createdAt'];
		const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'sortOrder';
		queryBuilder.orderBy(`faq.${sortField}`, sortOrder);

		// Apply pagination
		const offset = (page - 1) * limit;
		queryBuilder.skip(offset).take(limit);

		const [data, total] = await queryBuilder.getManyAndCount();

		return {
			data,
			total,
			page,
			limit,
		};
	}

	/**
	 * Get active FAQs for public use
	 */
	async getActiveFaqs(): Promise<Faq[]> {
		return this.faqRepository.find({
			where: {
				isActive: true,
				deletedAt: null,
			},
			order: {
				sortOrder: 'ASC',
			},
		});
	}

	/**
	 * Toggle active status
	 */
	async toggleActive(id: number): Promise<Faq> {
		const faq = await this.findOne({ where: { id } });
		if (!faq) {
			throw new Error('FAQ not found');
		}

		faq.isActive = !faq.isActive;
		return this.save(faq);
	}

	/**
	 * Bulk toggle active status
	 */
	async bulkToggleActive(ids: number[]): Promise<Faq[]> {
		const faqs = await this.faqRepository.findByIds(ids);

		for (const faq of faqs) {
			faq.isActive = !faq.isActive;
		}

		return this.faqRepository.save(faqs);
	}

	/**
	 * Update sort order
	 */
	async updateSortOrder(id: number, sortOrder: number): Promise<Faq> {
		const faq = await this.findOne({ where: { id } });
		if (!faq) {
			throw new Error('FAQ not found');
		}

		faq.sortOrder = sortOrder;
		return this.save(faq);
	}

	/**
	 * Count FAQs with optional filters
	 */
	async count(options?: any): Promise<number> {
		return this.faqRepository.count(options);
	}
}