import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFooterColumnsDto } from './dto/get-footer-columns.dto';
import { FooterColumn } from './entities/footer-column.entity';

@Injectable()
export class FooterColumnRepository extends AbstractRepository<FooterColumn> {
	constructor(
		@InjectRepository(FooterColumn)
		private readonly footerColumnRepository: Repository<FooterColumn>,
	) {
		super(footerColumnRepository);
	}

	async findAllWithFilters(query: GetFooterColumnsDto): Promise<{ data: FooterColumn[]; total: number; }> {
		const {
			activeOnly = "false",
			includeItems = true,
			page,
			limit,
			search
		} = query;

		const queryBuilder = this.footerColumnRepository
			.createQueryBuilder('column');

		if (includeItems) {
			queryBuilder
				.leftJoinAndSelect('column.items', 'items')
				.orderBy('column.sortOrder', 'ASC')
				.addOrderBy('items.sortOrder', 'ASC');
		}
		console.log({ activeOnly });

		if (activeOnly === 'true') {
			queryBuilder.andWhere('column.isActive = :isActive', { isActive: true });
			if (includeItems) {
				queryBuilder.andWhere('(items.isActive = :itemIsActive OR items.isActive IS NULL)', { itemIsActive: true });
			}
		}

		if (search) {
			queryBuilder.andWhere(
				'(LOWER(column.title) LIKE LOWER(:search) OR LOWER(column.slug) LIKE LOWER(:search))',
				{ search: `%${search}%` }
			);
		}

		queryBuilder.orderBy('column.sortOrder', 'ASC');

		if (page && limit) {
			const skip = (page - 1) * limit;
			queryBuilder.skip(skip).take(limit);
		}

		const [data, total] = await queryBuilder.getManyAndCount();

		return { data, total };
	}

	async findByColumnId(columnId: number): Promise<FooterColumn | null> {
		return this.footerColumnRepository.findOne({
			where: { id: columnId },
			relations: ['items']
		});
	}

	async checkSlugExists(slug: string, excludeColumnId?: number): Promise<boolean> {
		const query = this.footerColumnRepository
			.createQueryBuilder('column')
			.where('LOWER(column.slug) = LOWER(:slug)', { slug });

		if (excludeColumnId) {
			query.andWhere('column.columnId != :excludeColumnId', { excludeColumnId });
		}

		const count = await query.getCount();
		return count > 0;
	}

	async getMaxSortOrder(): Promise<number> {
		const result = await this.footerColumnRepository
			.createQueryBuilder('column')
			.select('MAX(column.sortOrder)', 'maxOrder')
			.getRawOne();

		return result?.maxOrder || 0;
	}

	async findAllActive(): Promise<FooterColumn[]> {
		return this.footerColumnRepository.find({
			where: { isActive: true },
			relations: ['items'],
			order: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } }
		});
	}
}