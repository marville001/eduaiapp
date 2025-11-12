import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
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
	UseGuards
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CreateNavbarMenuDto } from './dto/create-navbar-menu.dto';
import { GetNavbarMenusDto } from './dto/get-navbar-menus.dto';
import { UpdateNavbarMenuDto } from './dto/update-navbar-menu.dto';
import { NavbarMenuService } from './navbar-menu.service';

@ApiTags('Navbar Menus')
@Controller('navbar-menus')
export class NavbarMenuController {
	constructor(private readonly navbarMenuService: NavbarMenuService) { }

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@ApiBearerAuth('JWT')
	@ApiOperation({ summary: 'Create a new navbar menu' })
	@ApiResponse({ status: 201, description: 'Menu created successfully.' })
	@ApiResponse({ status: 400, description: 'Bad request.' })
	@ApiResponse({ status: 409, description: 'Slug already exists.' })
	create(@Body() createNavbarMenuDto: CreateNavbarMenuDto) {
		return this.navbarMenuService.create(createNavbarMenuDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all navbar menus with optional filtering' })
	@ApiResponse({ status: 200, description: 'List of navbar menus.' })
	@ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
	@ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
	@ApiQuery({ name: 'parentId', required: false, type: String })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'search', required: false, type: String })
	findAll(@Query() query: GetNavbarMenusDto) {
		return this.navbarMenuService.findAll(query);
	}

	@Get('hierarchical')
	@ApiOperation({ summary: 'Get navbar menus in hierarchical structure' })
	@ApiResponse({ status: 200, description: 'Hierarchical list of navbar menus.' })
	@ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
	findHierarchical(@Query('activeOnly') activeOnly?: boolean) {
		return this.navbarMenuService.findAll({
			activeOnly: activeOnly ?? true,
			includeChildren: true
		});
	}

	@Get('slug/:slug')
	@ApiOperation({ summary: 'Get navbar menu by slug' })
	@ApiResponse({ status: 200, description: 'Navbar menu found.' })
	@ApiResponse({ status: 404, description: 'Menu not found.' })
	@ApiParam({ name: 'slug', description: 'Menu slug' })
	findBySlug(@Param('slug') slug: string) {
		return this.navbarMenuService.findBySlug(slug);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get navbar menu by ID' })
	@ApiResponse({ status: 200, description: 'Navbar menu found.' })
	@ApiResponse({ status: 404, description: 'Menu not found.' })
	@ApiParam({ name: 'id', description: 'Menu UUID' })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.navbarMenuService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@ApiBearerAuth('JWT')
	@ApiOperation({ summary: 'Update navbar menu' })
	@ApiResponse({ status: 200, description: 'Menu updated successfully.' })
	@ApiResponse({ status: 404, description: 'Menu not found.' })
	@ApiResponse({ status: 409, description: 'Slug already exists.' })
	@ApiParam({ name: 'id', description: 'Menu UUID' })
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateNavbarMenuDto: UpdateNavbarMenuDto,
	) {
		return this.navbarMenuService.update(id, updateNavbarMenuDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@ApiBearerAuth('JWT')
	@ApiOperation({ summary: 'Delete navbar menu' })
	@ApiResponse({ status: 200, description: 'Menu deleted successfully.' })
	@ApiResponse({ status: 404, description: 'Menu not found.' })
	@ApiResponse({ status: 400, description: 'Cannot delete menu with children.' })
	@ApiParam({ name: 'id', description: 'Menu UUID' })
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.navbarMenuService.remove(id);
	}

	@Patch(':id/sort-order')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@ApiBearerAuth('JWT')
	@ApiOperation({ summary: 'Update menu sort order' })
	@ApiResponse({ status: 200, description: 'Sort order updated successfully.' })
	@ApiResponse({ status: 404, description: 'Menu not found.' })
	@ApiParam({ name: 'id', description: 'Menu UUID' })
	updateSortOrder(
		@Param('id', ParseIntPipe) id: number,
		@Body('sortOrder') sortOrder: number,
	) {
		return this.navbarMenuService.updateSortOrder(id, sortOrder);
	}

	@Post('reorder')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@ApiBearerAuth('JWT')
	@ApiOperation({ summary: 'Reorder menus' })
	@ApiResponse({ status: 200, description: 'Menus reordered successfully.' })
	@ApiResponse({ status: 400, description: 'Invalid menu IDs.' })
	reorder(
		@Body('parentId') parentId: number | null,
		@Body('menuIds') menuIds: number[],
	) {
		return this.navbarMenuService.reorderMenus(parentId, menuIds);
	}

	@Patch(':id/toggle-active')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@ApiBearerAuth('JWT')
	@ApiOperation({ summary: 'Toggle menu active status' })
	@ApiResponse({ status: 200, description: 'Menu status toggled successfully.' })
	@ApiResponse({ status: 404, description: 'Menu not found.' })
	@ApiParam({ name: 'id', description: 'Menu UUID' })
	toggleActive(@Param('id', ParseIntPipe) id: number) {
		return this.navbarMenuService.toggleActive(id);
	}
}