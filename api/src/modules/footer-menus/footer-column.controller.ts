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
import { CreateFooterColumnDto } from './dto/create-footer-column.dto';
import { GetFooterColumnsDto } from './dto/get-footer-columns.dto';
import { UpdateFooterColumnDto } from './dto/update-footer-column.dto';
import { FooterColumnService } from './footer-column.service';

@Controller('footer-columns')
export class FooterColumnController {
	constructor(private readonly footerColumnService: FooterColumnService) { }

	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Body() createFooterColumnDto: CreateFooterColumnDto) {
		return this.footerColumnService.create(createFooterColumnDto);
	}

	@Get()
	findAll(@Query() query: GetFooterColumnsDto) {
		return this.footerColumnService.findAll(query);
	}

	@Get('active')
	findActive() {
		return this.footerColumnService.getActiveColumns();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.footerColumnService.findOne(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateFooterColumnDto: UpdateFooterColumnDto,
	) {
		return this.footerColumnService.update(id, updateFooterColumnDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/toggle')
	toggleActive(@Param('id', ParseIntPipe) id: number) {
		return this.footerColumnService.toggleActive(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/sort')
	updateSortOrder(
		@Param('id', ParseIntPipe) id: number,
		@Body('sortOrder') sortOrder: number,
	) {
		return this.footerColumnService.updateSortOrder(id, sortOrder);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.footerColumnService.remove(id);
	}
}