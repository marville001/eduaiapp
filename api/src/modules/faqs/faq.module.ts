import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';
import { FaqController } from './faq.controller';
import { FaqRepository } from './faq.repository';
import { FaqService } from './faq.service';

@Module({
	imports: [TypeOrmModule.forFeature([Faq])],
	controllers: [FaqController],
	providers: [FaqService, FaqRepository],
	exports: [FaqService, FaqRepository],
})
export class FaqModule { }