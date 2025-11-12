import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FooterColumn } from './entities/footer-column.entity';
import { FooterItem } from './entities/footer-item.entity';
import { FooterColumnController } from './footer-column.controller';
import { FooterColumnRepository } from './footer-column.repository';
import { FooterColumnService } from './footer-column.service';
import { FooterItemController } from './footer-item.controller';
import { FooterItemRepository } from './footer-item.repository';
import { FooterItemService } from './footer-item.service';

@Module({
	imports: [TypeOrmModule.forFeature([FooterColumn, FooterItem])],
	controllers: [FooterColumnController, FooterItemController],
	providers: [
		FooterColumnRepository,
		FooterItemRepository,
		FooterColumnService,
		FooterItemService,
	],
	exports: [FooterColumnService, FooterItemService],
})
export class FooterMenuModule { }