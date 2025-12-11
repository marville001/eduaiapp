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
import { CreatePromoBannerDto, GetPromoBannersQueryDto, UpdatePromoBannerDto } from './dto';
import { PromoBanner } from './entities/promo-banner.entity';
import { PromoBannerService } from './promo-banner.service';

@Controller('promo-banners')
export class PromoBannerController {
	constructor(private readonly promoBannerService: PromoBannerService) { }

	/**
	 * Create a new promo banner (Admin only)
	 */
	@Post()
	@UseGuards(JwtAuthGuard)
	async createPromoBanner(@Body(ValidationPipe) createPromoBannerDto: CreatePromoBannerDto) {
		return await this.promoBannerService.createPromoBanner(createPromoBannerDto);
	}

	/**
	 * Get all promo banners with filtering and pagination
	 */
	@Get()
	async getAllPromoBanners(@Query(ValidationPipe) query: GetPromoBannersQueryDto): Promise<{
		data: PromoBanner[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const result = await this.promoBannerService.getAllPromoBanners(query);
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
	 * Get active promo banners (Public endpoint)
	 */
	@Get('active')
	async getActivePromoBanners(@Query('placement') placement?: string) {
		return await this.promoBannerService.getActivePromoBanners(placement);
	}

	/**
	 * Get promo banner by ID
	 */
	@Get(':id')
	async getPromoBannerById(@Param('id', ParseIntPipe) id: number) {
		return await this.promoBannerService.getPromoBannerById(id);
	}

	/**
	 * Update an existing promo banner (Admin only)
	 */
	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async updatePromoBanner(
		@Param('id', ParseIntPipe) id: number,
		@Body(ValidationPipe) updatePromoBannerDto: UpdatePromoBannerDto,
	) {
		return await this.promoBannerService.updatePromoBanner(id, updatePromoBannerDto);
	}

	/**
	 * Delete a promo banner (Admin only)
	 */
	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	async deletePromoBanner(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; }> {
		await this.promoBannerService.deletePromoBanner(id);
		return { message: 'Promo banner deleted successfully' };
	}

	/**
	 * Toggle active status (Admin only)
	 */
	@Patch(':id/toggle-active')
	@UseGuards(JwtAuthGuard)
	async toggleActiveStatus(@Param('id', ParseIntPipe) id: number) {
		return await this.promoBannerService.toggleActiveStatus(id);
	}

	/**
	 * Update sort order (Admin only)
	 */
	@Patch('sort-order/update')
	@UseGuards(JwtAuthGuard)
	async updateSortOrder(@Body() items: { id: number; sortOrder: number; }[]) {
		await this.promoBannerService.updateSortOrder(items);
		return { message: 'Sort order updated successfully' };
	}
}
