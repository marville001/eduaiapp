import { AbstractRepository } from '@/database/abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { NavbarMenu } from './entities/navbar-menu.entity';

@Injectable()
export class NavbarMenuRepository extends AbstractRepository<NavbarMenu> {
	constructor(
		@InjectRepository(NavbarMenu)
		private readonly navbarMenuRepository: Repository<NavbarMenu>,
	) {
		super(navbarMenuRepository);
	}

	async findHierarchical(activeOnly: boolean = true): Promise<NavbarMenu[]> {
		const whereCondition: FindOptionsWhere<NavbarMenu> = {
			parentId: IsNull(),
		};

		if (activeOnly) {
			whereCondition.isActive = true;
		}

		return this.navbarMenuRepository.find({
			where: whereCondition,
			relations: {
				children: {
					children: {
						children: true, // Support for 3 levels of nesting
					},
				},
			},
			order: {
				sortOrder: 'ASC',
				children: {
					sortOrder: 'ASC',
					children: {
						sortOrder: 'ASC',
					},
				},
			},
		});
	}

	async findByParent(
		parentId?: number,
		activeOnly: boolean = true,
		includeChildren: boolean = false
	): Promise<NavbarMenu[]> {
		const whereCondition: FindOptionsWhere<NavbarMenu> = {
			parentId: parentId || IsNull(),
		};

		if (activeOnly) {
			whereCondition.isActive = true;
		}

		const relations: any = {};
		if (includeChildren) {
			relations.children = {
				children: {
					children: true,
				},
			};
		}

		return this.navbarMenuRepository.find({
			where: whereCondition,
			relations,
			order: {
				sortOrder: 'ASC',
				...(includeChildren && {
					children: {
						sortOrder: 'ASC',
						children: {
							sortOrder: 'ASC',
						},
					},
				}),
			},
		});
	}

	async findWithPagination(
		page: number = 1,
		limit: number = 20,
		search?: string,
		activeOnly?: boolean,
		parentId?: number
	) {
		const skip = (page - 1) * limit;
		const whereConditions: FindOptionsWhere<NavbarMenu>[] = [];

		if (search) {
			const searchConditions: FindOptionsWhere<NavbarMenu>[] = [
				{ title: ILike(`%${search}%`) },
				{ slug: ILike(`%${search}%`) },
				{ description: ILike(`%${search}%`) },
			];

			if (activeOnly !== undefined) {
				searchConditions.forEach(condition => {
					condition.isActive = activeOnly;
				});
			}

			if (parentId !== undefined) {
				searchConditions.forEach(condition => {
					condition.parentId = parentId || IsNull();
				});
			}

			whereConditions.push(...searchConditions);
		} else {
			const baseCondition: FindOptionsWhere<NavbarMenu> = {};

			if (activeOnly !== undefined) {
				baseCondition.isActive = activeOnly;
			}

			if (parentId !== undefined) {
				baseCondition.parentId = parentId || IsNull();
			}

			whereConditions.push(baseCondition);
		}

		const [menus, total] = await this.navbarMenuRepository.findAndCount({
			where: whereConditions,
			relations: {
				parent: true,
				children: true,
			},
			skip,
			take: limit,
			order: {
				sortOrder: 'ASC',
				createdAt: 'DESC',
			},
		});

		return {
			data: menus,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findBySlug(slug: string): Promise<NavbarMenu | null> {
		return this.navbarMenuRepository.findOne({
			where: { slug },
			relations: {
				parent: true,
				children: {
					children: {
						children: true,
					},
				},
			},
		});
	}

	async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
		const whereCondition: FindOptionsWhere<NavbarMenu> = { slug };

		if (excludeId) {
			whereCondition.id = { $ne: excludeId } as any;
		}

		const count = await this.navbarMenuRepository.count({
			where: whereCondition,
		});

		return count > 0;
	}

	async getMaxSortOrder(parentId?: number): Promise<number> {
		const result = await this.navbarMenuRepository.findOne({
			where: { parentId: parentId || IsNull() },
			order: { sortOrder: 'DESC' },
			select: ['sortOrder'],
		});

		return result?.sortOrder || 0;
	}
}