import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFaqDto, GetFaqsQueryDto, UpdateFaqDto } from './dto';
import { Faq } from './entities/faq.entity';
import { FaqRepository } from './faq.repository';

@Injectable()
export class FaqService {
	constructor(private readonly faqRepository: FaqRepository) { }

	/**
	 * Create a new FAQ
	 */
	async createFaq(createFaqDto: CreateFaqDto): Promise<Faq> {
		try {
			// Check if FAQ with same question already exists
			const existingFaq = await this.faqRepository.findOne({
				where: { question: createFaqDto.question },
			});

			if (existingFaq) {
				throw new BadRequestException('FAQ with this question already exists');
			}

			const faq = new Faq({
				...createFaqDto,
			});

			return this.faqRepository.save(faq);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException('Failed to create FAQ');
		}
	}

	/**
	 * Get all FAQs with filtering and pagination
	 */
	async getAllFaqs(query: GetFaqsQueryDto): Promise<{
		data: Faq[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		const result = await this.faqRepository.getFaqs(query);
		const totalPages = Math.ceil(result.total / result.limit);

		return {
			...result,
			totalPages,
		};
	}

	/**
	 * Get active FAQs for public use
	 */
	async getActiveFaqs(): Promise<Faq[]> {
		return this.faqRepository.getActiveFaqs();
	}

	/**
	 * Get FAQ by ID
	 */
	async getFaqById(id: number): Promise<Faq> {
		const faq = await this.faqRepository.findOne({ where: { id } });

		if (!faq) {
			throw new NotFoundException('FAQ not found');
		}

		return faq;
	}

	/**
	 * Update an existing FAQ
	 */
	async updateFaq(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
		const faq = await this.faqRepository.findOne({ where: { id } });

		if (!faq) {
			throw new NotFoundException('FAQ not found');
		}

		// Check if question is being updated and if it conflicts with another FAQ
		if (updateFaqDto.question && updateFaqDto.question !== faq.question) {
			const existingFaq = await this.faqRepository.findOne({
				where: { question: updateFaqDto.question },
			});

			if (existingFaq && existingFaq.id !== id) {
				throw new BadRequestException('FAQ with this question already exists');
			}
		}

		Object.assign(faq, updateFaqDto);
		return this.faqRepository.save(faq);
	}

	/**
	 * Delete an FAQ
	 */
	async deleteFaq(id: number): Promise<void> {
		const faq = await this.faqRepository.findOne({ where: { id } });

		if (!faq) {
			throw new NotFoundException('FAQ not found');
		}

		await this.faqRepository.deleteByCriteria({
			id
		});
	}

	/**
	 * Toggle active status
	 */
	async toggleActiveStatus(id: number): Promise<Faq> {
		try {
			return await this.faqRepository.toggleActive(id);
		} catch (error) {
			throw new NotFoundException('FAQ not found');
		}
	}

	/**
	 * Update sort order
	 */
	async updateSortOrder(id: number, sortOrder: number): Promise<Faq> {
		try {
			return await this.faqRepository.updateSortOrder(id, sortOrder);
		} catch (error) {
			throw new NotFoundException('FAQ not found');
		}
	}

	/**
	 * Bulk toggle active status
	 */
	async bulkToggleActive(ids: number[]): Promise<Faq[]> {
		if (!ids || ids.length === 0) {
			throw new BadRequestException('No FAQ IDs provided');
		}

		try {
			return await this.faqRepository.bulkToggleActive(ids);
		} catch (error) {
			throw new BadRequestException('Failed to bulk toggle active status');
		}
	}
}