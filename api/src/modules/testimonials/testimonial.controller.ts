import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { GetTestimonialsDto } from './dto/get-testimonials.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialService } from './testimonial.service';

@Controller('testimonials')
export class TestimonialController {
	constructor(private readonly testimonialService: TestimonialService) { }

	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Body() createTestimonialDto: CreateTestimonialDto) {
		return this.testimonialService.create(createTestimonialDto);
	}

	@Get()
	findAll(@Query() query: GetTestimonialsDto) {
		return this.testimonialService.findAll(query);
	}

	@Get('active')
	findActive() {
		return this.testimonialService.getActiveTestimonials();
	}

	@Get('featured')
	findFeatured() {
		return this.testimonialService.getFeaturedTestimonials();
	}

	@Get('categories')
	getCategories() {
		return this.testimonialService.getCategories();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.testimonialService.findOne(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateTestimonialDto: UpdateTestimonialDto,
	) {
		return this.testimonialService.update(id, updateTestimonialDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/toggle-active')
	toggleActive(@Param('id') id: string) {
		return this.testimonialService.toggleActive(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/toggle-featured')
	toggleFeatured(@Param('id') id: string) {
		return this.testimonialService.toggleFeatured(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/sort')
	updateSortOrder(
		@Param('id') id: string,
		@Body('sortOrder') sortOrder: number,
	) {
		return this.testimonialService.updateSortOrder(id, sortOrder);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('bulk/toggle-active')
	bulkToggleActive(@Body('testimonialIds') testimonialIds: string[]) {
		return this.testimonialService.bulkToggleActive(testimonialIds);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('bulk/toggle-featured')
	bulkToggleFeatured(@Body('testimonialIds') testimonialIds: string[]) {
		return this.testimonialService.bulkToggleFeatured(testimonialIds);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.testimonialService.remove(id);
	}
}