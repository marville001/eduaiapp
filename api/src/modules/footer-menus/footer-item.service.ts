import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFooterItemDto } from './dto/create-footer-item.dto';
import { GetFooterItemsDto } from './dto/get-footer-items.dto';
import { UpdateFooterItemDto } from './dto/update-footer-item.dto';
import { FooterItem } from './entities/footer-item.entity';
import { FooterColumnRepository } from './footer-column.repository';
import { FooterItemRepository } from './footer-item.repository';

@Injectable()
export class FooterItemService {
	constructor(
		private readonly footerItemRepository: FooterItemRepository,
		private readonly footerColumnRepository: FooterColumnRepository,
	) { }

	async create(createFooterItemDto: CreateFooterItemDto): Promise<FooterItem> {
		// Check if parent column exists
		const parentColumn = await this.footerColumnRepository.findByColumnId(createFooterItemDto.columnId);
		if (!parentColumn) {
			throw new NotFoundException(`Column with ID '${createFooterItemDto.columnId}' not found`);
		}

		// Check if slug already exists in this column
		const slugExists = await this.footerItemRepository.checkSlugExistsInColumn(
			createFooterItemDto.slug,
			createFooterItemDto.columnId
		);
		if (slugExists) {
			throw new ConflictException(
				`Item with slug '${createFooterItemDto.slug}' already exists in this column`
			);
		}

		// Set sort order if not provided
		if (createFooterItemDto.sortOrder === undefined) {
			const maxSortOrder = await this.footerItemRepository.getMaxSortOrderInColumn(createFooterItemDto.columnId);
			createFooterItemDto.sortOrder = maxSortOrder + 1;
		}

		const footerItem = new FooterItem(createFooterItemDto);
		return this.footerItemRepository.create(footerItem);
	}

	async findAll(query: GetFooterItemsDto) {
		const { page, limit } = query;

		const result = await this.footerItemRepository.findAllWithFilters(query);

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

	async findOne(itemId: number): Promise<FooterItem> {
		const footerItem = await this.footerItemRepository.findByItemId(itemId);
		if (!footerItem) {
			throw new NotFoundException(`Footer item with ID '${itemId}' not found`);
		}
		return footerItem;
	}

	async update(itemId: number, updateFooterItemDto: UpdateFooterItemDto): Promise<FooterItem> {
		const footerItem = await this.findOne(itemId);

		// Check if column exists (if columnId is being updated)
		if (updateFooterItemDto.columnId) {
			const parentColumn = await this.footerColumnRepository.findByColumnId(updateFooterItemDto.columnId);
			if (!parentColumn) {
				throw new NotFoundException(`Column with ID '${updateFooterItemDto.columnId}' not found`);
			}
		}

		// Check if slug already exists in the column (excluding current item)
		if (updateFooterItemDto.slug) {
			const columnId = updateFooterItemDto.columnId || footerItem.columnId;
			const slugExists = await this.footerItemRepository.checkSlugExistsInColumn(
				updateFooterItemDto.slug,
				columnId,
				itemId
			);
			if (slugExists) {
				throw new ConflictException(
					`Item with slug '${updateFooterItemDto.slug}' already exists in this column`
				);
			}
		}

		Object.assign(footerItem, updateFooterItemDto);
		return this.footerItemRepository.save(footerItem);
	}

	async remove(itemId: number): Promise<void> {
		const footerItem = await this.findOne(itemId);
		await this.footerItemRepository.deleteByCriteria({
			id: footerItem.id,
			itemId: footerItem.itemId,
		});
	}

	async toggleActive(itemId: number): Promise<FooterItem> {
		const footerItem = await this.findOne(itemId);
		footerItem.isActive = !footerItem.isActive;
		return this.footerItemRepository.save(footerItem);
	}

	async updateSortOrder(itemId: number, newSortOrder: number): Promise<FooterItem> {
		const footerItem = await this.findOne(itemId);
		footerItem.sortOrder = Math.max(0, newSortOrder);
		return this.footerItemRepository.save(footerItem);
	}

	async findByColumnId(columnId: number): Promise<FooterItem[]> {
		return this.footerItemRepository.findByColumnId(columnId);
	}

	async bulkToggleActive(itemIds: number[]): Promise<FooterItem[]> {
		const items = await Promise.all(
			itemIds.map(itemId => this.toggleActive(itemId))
		);
		return items;
	}
}