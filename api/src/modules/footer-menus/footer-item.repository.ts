import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFooterItemsDto } from './dto/get-footer-items.dto';
import { FooterItem } from './entities/footer-item.entity';

@Injectable()
export class FooterItemRepository extends AbstractRepository<FooterItem> {
	constructor(
		@InjectRepository(FooterItem)
		private readonly footerItemRepository: Repository<FooterItem>,
	) {
		super(footerItemRepository);
	}

	async findAllWithFilters(query: GetFooterItemsDto): Promise<{ data: FooterItem[]; total: number; }> {
		const {
			activeOnly = true,
			columnId,
			page,
			limit,
			search
		} = query;

		const queryBuilder = this.footerItemRepository
			.createQueryBuilder('item')
			.leftJoinAndSelect('item.column', 'column');

		if (activeOnly) {
			queryBuilder.andWhere('item.isActive = :isActive', { isActive: true });
		}

		if (columnId) {
			queryBuilder.andWhere('item.columnId = :columnId', { columnId });
		}

		if (search) {
			queryBuilder.andWhere(
				'(LOWER(item.title) LIKE LOWER(:search) OR LOWER(item.slug) LIKE LOWER(:search))',
				{ search: `%${search}%` }
			);
		}

		queryBuilder.orderBy('item.sortOrder', 'ASC');

		if (page && limit) {
			const skip = (page - 1) * limit;
			queryBuilder.skip(skip).take(limit);
		}

		const [data, total] = await queryBuilder.getManyAndCount();

		return { data, total };
	}

	async findByItemId(itemId: number): Promise<FooterItem | null> {
		return this.footerItemRepository.findOne({
			where: { id: itemId },
			relations: ['column']
		});
	}

	async checkSlugExistsInColumn(slug: string, columnId: number, excludeItemId?: number): Promise<boolean> {
		const query = this.footerItemRepository
			.createQueryBuilder('item')
			.where('LOWER(item.slug) = LOWER(:slug)', { slug })
			.andWhere('item.columnId = :columnId', { columnId });

		if (excludeItemId) {
			query.andWhere('item.id != :excludeItemId', { excludeItemId });
		}

		const count = await query.getCount();
		return count > 0;
	}

	async getMaxSortOrderInColumn(columnId: number): Promise<number> {
		const result = await this.footerItemRepository
			.createQueryBuilder('item')
			.select('MAX(item.sortOrder)', 'maxOrder')
			.where('item.id = :columnId', { columnId })
			.getRawOne();

		return result?.maxOrder || 0;
	}

	async findByColumnId(columnId: number): Promise<FooterItem[]> {
		return this.footerItemRepository.find({
			where: { columnId, isActive: true },
			order: { sortOrder: 'ASC' }
		});
	}
}