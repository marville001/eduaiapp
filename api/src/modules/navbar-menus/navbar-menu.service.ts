import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavbarMenuDto } from './dto/create-navbar-menu.dto';
import { GetNavbarMenusDto } from './dto/get-navbar-menus.dto';
import { UpdateNavbarMenuDto } from './dto/update-navbar-menu.dto';
import { NavbarMenu } from './entities/navbar-menu.entity';
import { NavbarMenuRepository } from './navbar-menu.repository';

@Injectable()
export class NavbarMenuService {
	constructor(private readonly navbarMenuRepository: NavbarMenuRepository) { }

	async create(createNavbarMenuDto: CreateNavbarMenuDto): Promise<NavbarMenu> {
		// Check if slug already exists
		const slugExists = await this.navbarMenuRepository.checkSlugExists(createNavbarMenuDto.slug);
		if (slugExists) {
			throw new ConflictException(`Menu with slug '${createNavbarMenuDto.slug}' already exists`);
		}

		// Validate parent menu exists if provided
		if (createNavbarMenuDto.parentId) {
			const parentMenu = await this.navbarMenuRepository.findById(createNavbarMenuDto.parentId);
			if (!parentMenu) {
				throw new NotFoundException(`Parent menu with ID '${createNavbarMenuDto.parentId}' not found`);
			}

			// Prevent creating nested menus more than 3 levels deep
			const depth = await this.getMenuDepth(createNavbarMenuDto.parentId);
			if (depth >= 3) {
				throw new BadRequestException('Cannot create menu more than 3 levels deep');
			}
		}

		// Set sort order if not provided
		if (createNavbarMenuDto.sortOrder === undefined) {
			const maxSortOrder = await this.navbarMenuRepository.getMaxSortOrder(createNavbarMenuDto.parentId);
			createNavbarMenuDto.sortOrder = maxSortOrder + 1;
		}

		const navbarMenu = new NavbarMenu(createNavbarMenuDto);
		return this.navbarMenuRepository.create(navbarMenu);
	}

	async findAll(query: GetNavbarMenusDto) {
		const {
			activeOnly = true,
			includeChildren = true,
			parentId,
			page,
			limit,
			search
		} = query;

		if (page && limit) {
			return this.navbarMenuRepository.findWithPagination(
				page,
				limit,
				search,
				activeOnly,
				parentId
			);
		}

		if (includeChildren && !parentId && !search) {
			return this.navbarMenuRepository.findHierarchical(activeOnly);
		}

		return this.navbarMenuRepository.findByParent(parentId, activeOnly, includeChildren);
	}

	async findOne(id: number): Promise<NavbarMenu> {
		const navbarMenu = await this.navbarMenuRepository.findOne({
			where: { id },
			relations: {
				parent: true,
				children: {
					children: {
						children: true,
					},
				},
			},
		});

		if (!navbarMenu) {
			throw new NotFoundException(`Menu with ID '${id}' not found`);
		}

		return navbarMenu;
	}

	async findBySlug(slug: string): Promise<NavbarMenu> {
		const navbarMenu = await this.navbarMenuRepository.findBySlug(slug);
		if (!navbarMenu) {
			throw new NotFoundException(`Menu with slug '${slug}' not found`);
		}
		return navbarMenu;
	}

	async update(id: number, updateNavbarMenuDto: UpdateNavbarMenuDto): Promise<NavbarMenu> {
		const navbarMenu = await this.findOne(id);

		// Check if slug is being updated and if it conflicts
		if (updateNavbarMenuDto.slug && updateNavbarMenuDto.slug !== navbarMenu.slug) {
			const slugExists = await this.navbarMenuRepository.checkSlugExists(updateNavbarMenuDto.slug, id);
			if (slugExists) {
				throw new ConflictException(`Menu with slug '${updateNavbarMenuDto.slug}' already exists`);
			}
		}

		// Validate parent menu exists and prevent circular references
		if (updateNavbarMenuDto.parentId !== undefined) {
			if (updateNavbarMenuDto.parentId) {
				// Check if parent exists
				const parentMenu = await this.navbarMenuRepository.findById(updateNavbarMenuDto.parentId);
				if (!parentMenu) {
					throw new NotFoundException(`Parent menu with ID '${updateNavbarMenuDto.parentId}' not found`);
				}

				// Prevent self-referencing
				if (updateNavbarMenuDto.parentId === id) {
					throw new BadRequestException('Menu cannot be its own parent');
				}

				// Prevent circular references by checking if the target parent is a descendant
				const isDescendant = await this.isDescendant(id, updateNavbarMenuDto.parentId);
				if (isDescendant) {
					throw new BadRequestException('Cannot set parent to a descendant menu');
				}

				// Check depth limit
				const depth = await this.getMenuDepth(updateNavbarMenuDto.parentId);
				if (depth >= 3) {
					throw new BadRequestException('Cannot move menu: would exceed maximum depth of 3 levels');
				}
			}
		}

		return this.navbarMenuRepository.update(
			{ id },
			updateNavbarMenuDto
		);
	}

	async remove(id: number): Promise<void> {
		const navbarMenu = await this.findOne(id);

		// Check if menu has children
		const children = await this.navbarMenuRepository.findByParent(id, false, false);
		if (children.length > 0) {
			throw new BadRequestException('Cannot delete menu that has child menus. Delete children first or move them to another parent.');
		}

		await this.navbarMenuRepository.deleteByCriteria({
			id: navbarMenu.id,
			menuId: navbarMenu.menuId
		});
	}

	async updateSortOrder(id: number, newSortOrder: number): Promise<NavbarMenu> {
		const updated = await this.navbarMenuRepository.update(
			{ id },
			{ sortOrder: newSortOrder }
		);
		return updated || await this.findOne(id);
	}

	async reorderMenus(parentId: number | null, menuIds: number[]): Promise<NavbarMenu[]> {
		const menus = await Promise.all(
			menuIds.map(async (menuId, index) => {
				const menu = await this.findOne(menuId);

				// Verify the menu belongs to the specified parent
				if (menu.parentId !== parentId) {
					throw new BadRequestException(`Menu '${menuId}' does not belong to the specified parent`);
				}

				const updatedMenu = await this.navbarMenuRepository.update(
					{ id: menuId },
					{ sortOrder: index }
				);
				return updatedMenu || await this.findOne(menuId);
			})
		);

		return menus;
	}

	async toggleActive(id: number): Promise<NavbarMenu> {
		const navbarMenu = await this.findOne(id);
		const updated = await this.navbarMenuRepository.update(
			{ id },
			{ isActive: !navbarMenu.isActive }
		);
		return updated || await this.findOne(id);
	}

	// Helper methods
	private async getMenuDepth(menuId: number, currentDepth: number = 0): Promise<number> {
		const menu = await this.navbarMenuRepository.findById(menuId);
		if (!menu || !menu.parentId) {
			return currentDepth;
		}
		return this.getMenuDepth(menu.parentId, currentDepth + 1);
	}

	private async isDescendant(ancestorId: number, potentialDescendantId: number): Promise<boolean> {
		const potentialDescendant = await this.navbarMenuRepository.findById(potentialDescendantId);
		if (!potentialDescendant || !potentialDescendant.parentId) {
			return false;
		}

		if (potentialDescendant.parentId === ancestorId) {
			return true;
		}

		return this.isDescendant(ancestorId, potentialDescendant.parentId);
	}
}