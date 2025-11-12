import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import { CreateFaqDto, GetFaqsQueryDto, UpdateFaqDto } from './dto';
import { Faq } from './entities/faq.entity';
import { FaqService } from './faq.service';

@Controller('faqs')
export class FaqController {
	constructor(private readonly faqService: FaqService) { }

	/**
	 * Create a new FAQ (Admin only)
	 */
	@Post()
	@UseGuards(JwtAuthGuard)
	async createFaq(@Body(ValidationPipe) createFaqDto: CreateFaqDto) {
		return await this.faqService.createFaq(createFaqDto);
	}

	/**
	 * Get all FAQs with filtering and pagination
	 */
	@Get()
	async getAllFaqs(@Query(ValidationPipe) query: GetFaqsQueryDto): Promise<{
		data: Faq[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const result = await this.faqService.getAllFaqs(query);
		return {
			data: result.data,
			pagination: {
				page: result.page,
				limit: result.limit,
				total: result.total,
				totalPages: result.totalPages,
			},
		};
	}

	/**
	 * Get active FAQs (Public endpoint)
	 */
	@Get('active')
	async getActiveFaqs() {
		return await this.faqService.getActiveFaqs();
	}

	/**
	 * Get FAQ by ID (Public endpoint - increments view count)
	 */
	@Get(':id')
	async getFaqById(@Param('id', ParseIntPipe) id: number) {
		return await this.faqService.getFaqById(id);
	}

	/**
	 * Update an existing FAQ (Admin only)
	 */
	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async updateFaq(
		@Param('id', ParseIntPipe) id: number,
		@Body(ValidationPipe) updateFaqDto: UpdateFaqDto,
	) {
		return await this.faqService.updateFaq(id, updateFaqDto);
	}

	/**
	 * Delete an FAQ (Admin only)
	 */
	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	async deleteFaq(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; }> {
		await this.faqService.deleteFaq(id);
		return { message: 'FAQ deleted successfully' };
	}

	/**
	 * Toggle active status (Admin only)
	 */
	@Patch(':id/toggle-active')
	@UseGuards(JwtAuthGuard)
	async toggleActiveStatus(@Param('id', ParseIntPipe) id: number) {
		return await this.faqService.toggleActiveStatus(id);
	}

	/**
	 * Update sort order (Admin only)
	 */
	@Patch(':id/sort')
	@UseGuards(JwtAuthGuard)
	async updateSortOrder(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: { sortOrder: number; },
	) {
		return await this.faqService.updateSortOrder(id, body.sortOrder);
	}

	/**
	 * Bulk toggle active status (Admin only)
	 */
	@Patch('bulk/toggle-active')
	@UseGuards(JwtAuthGuard)
	async bulkToggleActive(@Body() body: { faqIds: number[]; }) {
		return await this.faqService.bulkToggleActive(body.faqIds);
	}
}