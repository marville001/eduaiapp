import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialController } from './testimonial.controller';
import { TestimonialRepository } from './testimonial.repository';
import { TestimonialService } from './testimonial.service';

@Module({
	imports: [TypeOrmModule.forFeature([Testimonial])],
	controllers: [TestimonialController],
	providers: [TestimonialRepository, TestimonialService],
	exports: [TestimonialService],
})
export class TestimonialModule { }