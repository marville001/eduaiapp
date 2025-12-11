import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoBanner } from './entities/promo-banner.entity';
import { PromoBannerController } from './promo-banner.controller';
import { PromoBannerRepository } from './promo-banner.repository';
import { PromoBannerService } from './promo-banner.service';

@Module({
	imports: [TypeOrmModule.forFeature([PromoBanner])],
	controllers: [PromoBannerController],
	providers: [PromoBannerService, PromoBannerRepository],
	exports: [PromoBannerService, PromoBannerRepository],
})
export class PromoBannerModule { }
