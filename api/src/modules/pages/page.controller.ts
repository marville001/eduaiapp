import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageService } from './page.service';

@Controller('pages')
export class PageController {
	constructor(private readonly pageService: PageService) { }

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	create(@Body() createPageDto: CreatePageDto) {
		return this.pageService.create(createPageDto);
	}

	@Get()
	findAll(@Query('published') published?: string) {
		if (published === 'true') {
			return this.pageService.findPublished();
		}
		return this.pageService.findAll();
	}

	@Get('slug/:slug')
	findBySlug(@Param('slug') slug: string) {
		return this.pageService.findBySlug(slug);
	}

	@Get(':id')
	findOne(@Param('id') id: number) {
		return this.pageService.findOne(id);
	}

	@Patch(':id')
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	update(@Param('id') id: number, @Body() updatePageDto: UpdatePageDto) {
		return this.pageService.update(id, updatePageDto);
	}

	@Delete(':id')
	@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
	@UseGuards(JwtAuthGuard, RolesGuard)
	remove(@Param('id') id: number) {
		return this.pageService.remove(id);
	}

	@Patch(':id/views')
	incrementViews(@Param('id') id: number) {
		return this.pageService.incrementViews(id);
	}
}