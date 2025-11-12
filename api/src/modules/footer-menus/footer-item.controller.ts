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
	UseGuards
} from '@nestjs/common';
import { CreateFooterItemDto } from './dto/create-footer-item.dto';
import { GetFooterItemsDto } from './dto/get-footer-items.dto';
import { UpdateFooterItemDto } from './dto/update-footer-item.dto';
import { FooterItemService } from './footer-item.service';

@Controller('footer-items')
export class FooterItemController {
	constructor(private readonly footerItemService: FooterItemService) { }

	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Body() createFooterItemDto: CreateFooterItemDto) {
		return this.footerItemService.create(createFooterItemDto);
	}

	@Get()
	findAll(@Query() query: GetFooterItemsDto) {
		return this.footerItemService.findAll(query);
	}

	@Get('column/:columnId')
	findByColumn(@Param('columnId', ParseIntPipe) columnId: number) {
		return this.footerItemService.findByColumnId(columnId);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.footerItemService.findOne(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateFooterItemDto: UpdateFooterItemDto,
	) {
		return this.footerItemService.update(id, updateFooterItemDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/toggle')
	toggleActive(@Param('id', ParseIntPipe) id: number) {
		return this.footerItemService.toggleActive(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/sort')
	updateSortOrder(
		@Param('id', ParseIntPipe) id: number,
		@Body('sortOrder') sortOrder: number,
	) {
		return this.footerItemService.updateSortOrder(id, sortOrder);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('bulk/toggle')
	bulkToggleActive(@Body('itemIds') itemIds: number[]) {
		return this.footerItemService.bulkToggleActive(itemIds);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.footerItemService.remove(id);
	}
}