import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFooterColumnDto } from './dto/create-footer-column.dto';
import { GetFooterColumnsDto } from './dto/get-footer-columns.dto';
import { UpdateFooterColumnDto } from './dto/update-footer-column.dto';
import { FooterColumn } from './entities/footer-column.entity';
import { FooterColumnRepository } from './footer-column.repository';

@Injectable()
export class FooterColumnService {
	constructor(private readonly footerColumnRepository: FooterColumnRepository) { }

	async create(createFooterColumnDto: CreateFooterColumnDto): Promise<FooterColumn> {
		// Check if slug already exists
		const slugExists = await this.footerColumnRepository.checkSlugExists(createFooterColumnDto.slug);
		if (slugExists) {
			throw new ConflictException(`Column with slug '${createFooterColumnDto.slug}' already exists`);
		}

		// Set sort order if not provided
		if (createFooterColumnDto.sortOrder === undefined) {
			const maxSortOrder = await this.footerColumnRepository.getMaxSortOrder();
			createFooterColumnDto.sortOrder = maxSortOrder + 1;
		}

		const footerColumn = new FooterColumn(createFooterColumnDto);
		return this.footerColumnRepository.create(footerColumn);
	}

	async findAll(query: GetFooterColumnsDto) {
		const { page, limit } = query;

		const result = await this.footerColumnRepository.findAllWithFilters(query);

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

	async findOne(columnId: number): Promise<FooterColumn> {
		const footerColumn = await this.footerColumnRepository.findByColumnId(columnId);
		if (!footerColumn) {
			throw new NotFoundException(`Footer column with ID '${columnId}' not found`);
		}
		return footerColumn;
	}

	async update(columnId: number, updateFooterColumnDto: UpdateFooterColumnDto): Promise<FooterColumn> {
		const footerColumn = await this.findOne(columnId);

		// Check if slug already exists (excluding current column)
		if (updateFooterColumnDto.slug) {
			const slugExists = await this.footerColumnRepository.checkSlugExists(updateFooterColumnDto.slug, columnId);
			if (slugExists) {
				throw new ConflictException(`Column with slug '${updateFooterColumnDto.slug}' already exists`);
			}
		}

		Object.assign(footerColumn, updateFooterColumnDto);
		return this.footerColumnRepository.save(footerColumn);
	}

	async remove(columnId: number): Promise<void> {
		const footerColumn = await this.findOne(columnId);

		// Check if column has active items
		if (footerColumn.items && footerColumn.items.length > 0) {
			const activeItems = footerColumn.items.filter(item => item.isActive);
			if (activeItems.length > 0) {
				throw new BadRequestException(
					`Cannot delete column '${footerColumn.title}' because it has ${activeItems.length} active item(s). Please deactivate or delete all items first.`
				);
			}
		}

		await this.footerColumnRepository.deleteByCriteria({
			id: footerColumn.id,
			columnId: footerColumn.columnId
		});
	}

	async toggleActive(columnId: number): Promise<FooterColumn> {
		const footerColumn = await this.findOne(columnId);
		footerColumn.isActive = !footerColumn.isActive;
		return this.footerColumnRepository.save(footerColumn);
	}

	async updateSortOrder(columnId: number, newSortOrder: number): Promise<FooterColumn> {
		const footerColumn = await this.findOne(columnId);
		footerColumn.sortOrder = Math.max(0, newSortOrder);
		return this.footerColumnRepository.save(footerColumn);
	}

	async getActiveColumns(): Promise<FooterColumn[]> {
		return this.footerColumnRepository.findAllActive();
	}
}